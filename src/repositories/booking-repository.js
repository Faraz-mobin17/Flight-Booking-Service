const { Booking } = require("../models");
const CrudRepository = require("./crud-repository");

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async createBooking(data, transaction) {
    const response = await Booking.create(data, { transaction });
    return response;
  }

  async get(data, transaction) {
    const response = await this.model.findByPk(data, { transaction });
    if (!response) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }
    return response;
  }

  async update(id, data, transaction) {
    const response = await this.model.update(
      data,
      {
        where: {
          id: id,
        },
      },
      { transaction }
    );
    return response;
  }
}

module.exports = BookingRepository;
