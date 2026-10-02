const express = require("express");

const {
  createPayment,paymentWebhook
} = require("../controllers/paymentController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createPayment);

router.post("/webhook", paymentWebhook);

module.exports = router;