const pool = require('../db/db');
const crypto = require("crypto");

const createPayment = async (req, res) => {

    try {
    const userId = req.userId;
    const { booking_id, result } = req.body;

    if (!booking_id || !result) {
      return res.status(400).json({
        message: "booking_id and result are required",
      });
    }


    if (!["SUCCESS", "FAILED"].includes(result)) {
      return res.status(400).json({
        message: "Result must be SUCCESS or FAILED",
      });
    }

    const bookingResult = await pool.query(
      `SELECT id, amount, status
       FROM bookings
       WHERE id = $1 AND user_id = $2`,
      [booking_id, userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }


    const booking = bookingResult.rows[0];

    if (booking.status !== "PENDING") {
      return res.status(400).json({
        message: "Booking is already processed",
      });
    }

    const eventId = crypto.randomUUID();


    const paymentResult = await pool.query(
      `INSERT INTO payments
       (booking_id, event_id, amount, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        booking_id,
        eventId,
        booking.amount,
        result,
      ]
    );

    const bookingStatus = result === "SUCCESS" ? "Confirmed" : "Failed";

     await pool.query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2`,
      [bookingStatus, booking_id]
    );
    
    res.status(201).json({
      message: "Payment processed successfully",
      payment: paymentResult.rows[0],
      booking_status: bookingStatus,
    });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server Error"
        });
    }
};

const paymentWebhook = async (req, res) => {
  try {
    const {
      event_id,
      booking_id,
      amount,
      status,
    } = req.body || {};

    if (!event_id || !booking_id || !amount || !status) {
      return res.status(400).json({
        message: "event_id, booking_id, amount and status are required",
      });
    }

    if (!["SUCCESS", "FAILED"].includes(status)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    // Check duplicate event
    const existingPayment = await pool.query(
      `SELECT id
       FROM payments
       WHERE event_id = $1`,
      [event_id]
    );

    if (existingPayment.rows.length > 0) {
      return res.status(200).json({
        message: "Webhook already processed",
      });
    }

    // Check booking
    const bookingResult = await pool.query(
      `SELECT id, amount
       FROM bookings
       WHERE id = $1`,
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    // Amount validation
    if (Number(booking.amount) !== Number(amount)) {
      return res.status(400).json({
        message: "Payment amount does not match booking amount",
      });
    }

    // Insert payment
    await pool.query(
      `INSERT INTO payments
       (booking_id, event_id, amount, status)
       VALUES ($1, $2, $3, $4)`,
      [booking_id, event_id, amount, status]
    );

    const bookingStatus =
      status === "SUCCESS" ? "CONFIRMED" : "FAILED";

    await pool.query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2`,
      [bookingStatus, booking_id]
    );

    res.status(200).json({
      message: "Webhook processed successfully",
      booking_status: bookingStatus,
    });

  } catch (error) {
    console.error(error);

    // Duplicate event race condition
    if (error.code === "23505") {
      return res.status(200).json({
        message: "Webhook already processed",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createPayment,paymentWebhook
};