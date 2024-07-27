const { StatusCodes } = require("http-status-codes");
const axios = require("axios");
const { BookingRepository } = require("../repositories/booking-repository");
const db = require("../models");
const { API_URL } = require("../utils/common/api-constants");
const { ApiError, ApiResponse } = require("../utils/common");
const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;
const bookingRepository = new BookingRepository();

async function createBooking(data) {
  const transactions = await db.sequelize.transaction();
  try {
    const flight = await axios.get(API_URL + `flights/${data.flightId}`);
    const flightData = flight.data.data;

    if (data.noOfSeats > flightData.noOfSeats) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No of Seats exceeds  available seats"
      );
    }

    const totalBillingAmount = flightData.price * data.noOfSeats;

    const bookingPayload = {
      ...data,
      totalCost: totalBillingAmount,
    };

    const booking = await bookingRepository.createBooking(
      bookingPayload,
      transactions
    );

    await axios.patch(`${API_URL}flights/${data.flightId}/seats`, {
      seats: data.noOfSeats,
    });

    await transactions.commit();
    return booking;
  } catch (error) {
    await transactions.rollback();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
}

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(data.bookingId);
    if (bookingDetails.status === CANCELLED) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Booking time expired");
    }
    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();
    if (bookingTime - currentTime > 300000) {
      await cancelBooking(data.bookingId);
      throw new ApiError(StatusCodes.BAD_REQUEST, "Booking time expired");
    }
    if (!bookingDetails) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }
    if (bookingDetails.totalCost !== data.totalCost) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Total cost does not match with booking"
      );
    }
    if (bookingDetails.userId !== data.userId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "User is not authorized to make payment"
      );
    }
    // we assume here that payment is successfull
    await bookingRepository.update(data.bookingId, {
      status: BOOKED,
      transaction,
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
}

async function cancelBooking(bookingId) {
  try {
    const transaction = await db.sequelize.transaction();
    const bookingDetails = await bookingRepository.get(bookingId, transaction);
    if (!bookingDetails) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }
    if (bookingDetails.status === CANCELLED) {
      await transaction.commit();
      throw new ApiError(StatusCodes.BAD_REQUEST, "Booking already cancelled");
    }
    await axios.patch(`${API_URL}flights/${bookingDetails.flightId}/seats`, {
      seats: bookingDetails.noOfSeats,
      dec: 0,
    });
    await bookingRepository.update(
      bookingId,
      { status: CANCELLED },
      transaction
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
}

async function cancelOldBookings() {
  try {
    const time = new Date(Date.now() - 1000 * 300); // 5 min ago timestamp
    const response = await bookingRepository.cancelOldBookings(time);
    return response;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
}

module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
  cancelOldBookings,
};
