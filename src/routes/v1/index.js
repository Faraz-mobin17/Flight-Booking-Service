const express = require("express");

const BookingRoutes = require("./booking-route");
const InfoRoutes = require("./info-route");

const router = express.Router();

router.get("/info", InfoRoutes);
router.post("/bookings", BookingRoutes);

module.exports = router;
