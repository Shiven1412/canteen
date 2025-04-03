const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api/payments", paymentRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});