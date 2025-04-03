const express = require("express");
const { createOrder, saveOrder } = require("../controllers/paymentController");

const router = express.Router();

// Route to create a Razorpay order
router.post("/create-order", createOrder);
router.post("/save-order", saveOrder); // New route to save order details

module.exports = router;