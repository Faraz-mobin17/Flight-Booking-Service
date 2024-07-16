const { ApiError } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
function validatePayment(req, res, next) {
  if (!req.body.userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiError(StatusCodes.BAD_REQUEST, "User Id is required"));
  }
  if (!req.body.bookingId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiError(StatusCodes.BAD_REQUEST, "Booking Id is required"));
  }
  if (!req.body.totalCost) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiError(StatusCodes.BAD_REQUEST, "Total cost is required"));
  }
  next();
}

module.exports = {
  validatePayment,
};
