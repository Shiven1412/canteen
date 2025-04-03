import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const OrderBill = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData } = location.state || {}; // Get order data passed via navigation

  if (!orderData) {
    return (
      <div className="text-center mt-5">
        <h3>No order details found.</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Go to Home
        </button>
      </div>
    );
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const date = new Date(orderData.timestamp).toLocaleDateString();
    const time = new Date(orderData.timestamp).toLocaleTimeString();

    // Header
    doc.setFontSize(22);
    doc.text("CANTEEN RECEIPT", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text("Date: " + date, 10, 30);
    doc.text("Time: " + time, 10, 37);
    doc.text("Customer: " + orderData.userEmail, 10, 44);
    doc.text("Order Number: " + orderData.orderNumber, 10, 51);

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(10, 55, pageWidth - 10, 55);

    // Column headers
    doc.setFont("helvetica", "bold");
    doc.text("Item", 10, 65);
    doc.text("Qty", 130, 65);
    doc.text("Price", 150, 65);
    doc.text("Amount", 170, 65);

    // Items
    doc.setFont("helvetica", "normal");
    orderData.items.forEach((item, index) => {
      const y = 75 + index * 10;
      doc.text(item.name, 10, y);
      doc.text(item.quantity.toString(), 130, y);
      doc.text(item.price.toFixed(2), 150, y);
      doc.text((item.quantity * item.price).toFixed(2), 170, y);
    });

    // Footer
    const totalY = 85 + orderData.items.length * 10;
    doc.line(10, totalY, pageWidth - 10, totalY);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 130, totalY + 10);
    doc.text(`₹${orderData.total.toFixed(2)}`, 170, totalY + 10);

    doc.save(`Canteen-Bill-${date.replace(/\//g, "-")}-${time.replace(/\//g, "-")}.pdf`);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Order Summary</h1>
      <div className="card p-4">
        <h5>Order Number: {orderData.orderNumber}</h5>
        <h5>Date: {new Date(orderData.timestamp).toLocaleDateString()}</h5>
        <h5>Time: {new Date(orderData.timestamp).toLocaleTimeString()}</h5>
        <h5>Customer: {orderData.userEmail}</h5>
        <h5>Total Amount: ₹{orderData.total.toFixed(2)}</h5>
        <hr />
        <h5>Items:</h5>
        <ul>
          {orderData.items.map((item, index) => (
            <li key={index}>
              {item.quantity}x {item.name} (₹{item.price} each)
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <button className="btn btn-success me-3" onClick={generatePDF}>
            Download PDF
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderBill;