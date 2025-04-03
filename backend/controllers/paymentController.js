const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_SlQkgnZyXFrHYZ", // Replace with your Razorpay Key ID
  key_secret: "a1uN4TvEKoJNpGmcdYOSCXyo", // Replace with your Razorpay Secret
});

const createOrder = async (req, res) => {
  const { amount, currency } = req.body;

  console.log("Amount received in backend:", amount);

  try {
    const order = await razorpay.orders.create({
      amount: amount, // Use the amount directly (already in paise)
      currency: currency,
    });
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send(error);
  }
};

const saveOrder = async (req, res) => {
  const { orderNumber, paymentId, amount, mobileNumber, status } = req.body;

  try {
    // Save the order details in your database
    const orderRef = ref(database, `orders/${orderNumber}`);
    await set(orderRef, {
      paymentId,
      amount,
      mobileNumber,
      status,
      timestamp: Date.now(),
    });

    res.status(200).send({ message: "Order saved successfully" });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).send({ error: "Failed to save order" });
  }
};

module.exports = { createOrder, saveOrder };