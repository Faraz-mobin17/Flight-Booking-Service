const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { ApiError, ApiResponse } = require("../utils/common");
async function createBooking(req, res) {
  try {
    const booking = await BookingService.createBooking({
      flightId: req.body.flightId,
      uesrId: req.body.userId,
      noOfSeats: req.body.noOfSeats,
    });

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, booking, "Booking created successfully")
      );
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
}

async function makePayment(req, res) {
  try {
    const response = await BookingService.makePayment({
      bookingId: req.body.bookingId,
      totalCost: req.body.totalCost,
      userId: req.body.userId,
    });
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, response, "Payment successful"));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
}

module.exports = {
  createBooking,
  makePayment,
};
