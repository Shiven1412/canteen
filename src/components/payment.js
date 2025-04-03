import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const totalAmount = location.state?.totalAmount || 1; // Default to 1 if no amount is passed
  console.log("Total Amount:", totalAmount);
  const [mobileNumber, setMobileNumber] = useState("");
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");

  const initiatePayment = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      // Call the backend to create an order
      const response = await fetch("http://localhost:5001/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalAmount * 100, // Convert to paise
          currency: "INR",
        }),
      });

      const order = await response.json();
      console.log("Backend Response:", order);
      // Razorpay options
      const options = {
        key: "rzp_test_SlQkgnZyXFrHYZ", // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: "ACOEC",
        description: "Test Transaction",
        order_id: order.id, // Pass the order ID from the backend
        handler: function (response) {
          alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
          navigate("/"); // Redirect to home after successful payment
        },
        prefill: {
          name: name,
          email: "customer@example.com", // Replace with actual email if available
          contact: mobileNumber,
        },
        theme: {
          color: "#3399cc",
        },
      };

      // Open Razorpay payment gateway
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Make a Payment</h1>
      <p>Enter your details below to proceed with the payment.</p>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={{
            marginLeft: "10px",
            padding: "5px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="mobileNumber">Mobile Number:</label>
        <input
          type="text"
          id="mobileNumber"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          placeholder="Enter your mobile number"
          style={{
            marginLeft: "10px",
            padding: "5px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="mobileNumber">Floor:</label>
        <input
          type="text"
          id="floor"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          placeholder="Enter the floor number"
          style={{
            marginLeft: "10px",
            padding: "5px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="mobileNumber">Room:</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter your mobile number"
          style={{
            marginLeft: "10px",
            padding: "5px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>
      <button
        onClick={initiatePayment}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#3399cc",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Pay Now
      </button>
    </div>
  );
};

export default Payment;