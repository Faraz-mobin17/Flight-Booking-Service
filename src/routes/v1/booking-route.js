const express = require("express");
const router = express.Router();

const { BookingController } = require("../../controllers");
const { PaymentMiddleware } = require("../../middlewares");
router.post("/", BookingController.createBooking);
router.post(
  "/payments",
  PaymentMiddleware.validatePayment,
  BookingController.makePayment
);

module.exports = router;
