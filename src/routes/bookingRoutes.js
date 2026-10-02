const express = require("express");

const {
  createBooking,
  getMyBookings,
  getBookingById,
} = require("../controllers/bookingController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createBooking);

router.get("/my", authMiddleware, getMyBookings);

router.get("/:id", authMiddleware, getBookingById);

module.exports = router;