import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductList from "../ProductList/ProductList";
import CartModal from "../CartModal/CartModal";
import ProductDetailModal from "../ProductDetail/ProductDetailModal";
import Footer from "../Footer/Footer";
import AdminPanel from "../AdminPanel/AdminPanel";
import UserOrderHistory from "./UserOrderHistory";
import useProducts from "../../hooks/useProducts";
import { ref, update } from "firebase/database";
import { auth, database } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  Toast,
  Form,
  InputGroup,
  Container,
  Button,
  Modal
} from "react-bootstrap";
import { useAuth } from "../../AuthContext";
import jsPDF from "jspdf";
import useAdmin from '../../hooks/useAdmin';
import { AuthContext } from "../../AuthContext"
import useContext from "react"

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // This is enough - remove the useContext line
  const { products, updateProductQuantity } = useProducts();
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [originalQuantities, setOriginalQuantities] = useState({});
  const [showCheckoutToast, setShowCheckoutToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const isAdmin = useAdmin();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  console.log(currentUser); // Use the currentUser from useAuth()

  useEffect(() => {
    if (products && products.length > 0) {
      const updatedQuantities = products.reduce((acc, product) => {
        acc[product.id] = product.quantity;
        return acc;
      }, {});

      setOriginalQuantities(updatedQuantities);
    }
  }, [products]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Check if user is logged in and update admin status
    if (!currentUser) {
      setShowAdmin(false);
    }
  }, [currentUser]);

  const generatePDF = (orderNumber, totalAmount) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
  
    // Header
    doc.setFontSize(22);
    doc.text("CANTEEN RECEIPT", pageWidth / 2, 15, { align: "center" });
  
    doc.setFontSize(12);
    doc.text("Date: " + date, 10, 30);
    doc.text("Time: " + time, 10, 37);
    doc.text(
      "Customer: " + (currentUser?.displayName || currentUser?.email),
      10,
      44
    );
    doc.text("Order Number: " + orderNumber, 10, 51);
  
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
    cart.forEach((product, index) => {
      const y = 75 + index * 10;
      doc.text(product.name, 10, y);
      doc.text(product.quantity.toString(), 130, y);
      doc.text(product.price.toFixed(2), 150, y);
      doc.text((product.quantity * product.price).toFixed(2), 170, y);
    });
  
    // Footer
    const totalY = 85 + cart.length * 10;
    doc.line(10, totalY, pageWidth - 10, totalY);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 130, totalY + 10);
    doc.text(`₹${totalAmount.toFixed(2)}`, 170, totalY + 10);
  
    doc.save(
      `Canteen-Bill-${date.replace(/\//g, "-")}-${time.replace(/\//g, "-")}.pdf`
    );
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const productInCart = prevCart.find((p) => p.id === product.id);
      if (productInCart) {
        return prevCart.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setShowCartModal(true);
  };

  const incrementQuantity = (productId) => {
    const availableQuantity =
      originalQuantities[productId] -
      (cart.find((p) => p.id === productId)?.quantity || 0);
    if (availableQuantity > 0) {
      setCart((prevCart) =>
        prevCart.map((p) =>
          p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    }
  };

  const decrementQuantity = (productId) => {
    const productInCart = cart.find((p) => p.id === productId);
    if (productInCart && productInCart.quantity > 1) {
      setCart((prevCart) =>
        prevCart.map((p) =>
          p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
        )
      );
    }
  };

  const removeFromCart = (product) => {
    setCart((prevCart) => prevCart.filter((p) => p.id !== product.id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  const checkout = async (paymentMethod) => {
    const totalAmount = calculateTotal(); // Calculate the total amount
    const orderNumber = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit order number
  
    if (paymentMethod === "counter") {
      try {
        const orderData = {
          userEmail: currentUser?.email || "Guest",
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: totalAmount,
          status: "Pending", // Default status
          paymentStatus: "Unpaid", // Payment status for "Pay at Counter"
          orderNumber: orderNumber,
          timestamp: Date.now(),
        };
  
        const orderRef = ref(database, `sales/${new Date().toISOString().split("T")[0]}/${orderNumber}`);
        await update(orderRef, orderData);
  
        // Decrement stock quantities
        cart.forEach((item) => {
          const productRef = ref(database, `products/${item.id}`);
          update(productRef, {
            quantity: originalQuantities[item.id] - item.quantity,
          }).catch((error) => {
            console.error(`Error updating stock for product ${item.id}:`, error);
          });
        });
  
        // Navigate to the OrderBill component
        navigate("/order-bill", { state: { orderData } });
  
        setCart([]); // Clear the cart
        setShowCartModal(false);
      } catch (error) {
        console.error("Error placing order:", error);
        alert("Something went wrong. Please try again.");
      }
    } else if (paymentMethod === "online") {
      // Call the initiatePayment function for online payment
      setShowPaymentModal(true);
    }
  };

  const initiatePayment = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const totalAmount = calculateTotal(); // Calculate the total amount

    try {
      // Call the backend to create a Razorpay order
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
    


      // Razorpay options
      const options = {
        key: "rzp_test_SlQkgnZyXFrHYZ", // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: "ACOEC",
        description: "Test Transaction",
        order_id: order.id,
        handler: async function (response) {
          try {
            const orderData = {
              userEmail: currentUser?.email || "Guest",
              items: cart.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              total: totalAmount,
              status: "Paid", // Payment successful
              paymentStatus: "Paid",
              paymentId: response.razorpay_payment_id,
              orderNumber: Math.floor(1000 + Math.random() * 9000), // Generate a random order number
              timestamp: Date.now(),
            };
        
            const orderRef = ref(database, `sales/${new Date().toISOString().split("T")[0]}/${orderData.orderNumber}`);
            await update(orderRef, orderData);
        
            alert(`Payment successful! Your order number is ${orderData.orderNumber}`);
              
      cart.forEach((item) => {
        const productRef = ref(database, `products/${item.id}`);
        update(productRef, {
          quantity: originalQuantities[item.id] - item.quantity,
        }).catch((error) => {
          console.error(`Error updating stock for product ${item.id}:`, error);
        });
      });
            navigate("/order-bill", { state: { orderData } });
            setCart([]); // Clear the cart
            setShowPaymentModal(false);
          } catch (error) {
            console.error("Error saving order:", error);
            alert("Something went wrong while saving your order. Please contact support.");
          }
        },
        prefill: {
          name: name,
          contact: mobileNumber,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const filteredProducts = Array.isArray(products) 
  ? products.filter((product) =>
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];


  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetailModal(true);
  };

  const handleLogout = async () => {
    try {
      setLogoutError("");
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      setLogoutError("Failed to log out. Please try again.");
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate("/admin"); // Navigate to Admin Panel
    }
  };

  const handleHomeClick = () => {
    setShowAdmin(false);
    setShowOrderHistory(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Container className="d-flex flex-column align-items-center my-3 py-3">
        <h1 className="fw-bold">
          <Link
            to="/"
            className="text-decoration-none text-dark"
            onClick={() => {
              setShowAdmin(false);
              setShowOrderHistory(false);
            }}
          >
             ACOE Canteen Management
          </Link>
        </h1>

        <div className="d-flex justify-content-center">
          <button
            onClick={handleHomeClick}
            className="btn btn-Link text-decoration-none text-dark fw-bold"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="btn btn-Link text-decoration-none text-dark fw-bold"
          >
            My Orders
          </button>
          {isAdmin && (
            <button
              onClick={handleAdminClick}
              className="btn btn-Link text-decoration-none text-dark fw-bold"
            >
              Admin
            </button>
          )}
          {currentUser && (
            <div className="d-flex align-items-center fw-bold">
            <img
              src={`https://ui-avatars.com/api/?name=${currentUser.email}&background=random`}
              alt="profile"
              className="rounded-circle me-2"
              width="30"
              height="30"
            />
            {`Hello, ${currentUser.displayName || currentUser.email.split('@')[0]}`}

            <button className="rounded-5 btn button btn-sm m-2 btn-danger fw-bold" onClick={handleLogout}>Logout</button>
          </div>
          )}
        </div>
      </Container>

      <Container className="mt-5 flex-grow-1">
        {logoutError && (
          <Toast
            show={!!logoutError}
            onClose={() => setLogoutError("")}
            className="position-fixed top-0 end-0 m-3"
            bg="danger"
            text="white"
          >
            <Toast.Body>{logoutError}</Toast.Body>
          </Toast>
        )}

        {showAdmin ? (
          <AdminPanel />
        ) : showOrderHistory ? (
          <UserOrderHistory />
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4 row">
              <h1 className="fw-bold col">Today's items</h1>
              <Form.Group className="w-100 w-md-50 my-auto col">
                <InputGroup>
                  <InputGroup.Text>
                    <i className="fas fa-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </div>
            {cart.length > 0 && (
              <button
                className="btn btn-primary rounded-3"
                onClick={() => setShowCartModal(true)}
              >
                <i className="fas fa-shopping-cart me-2"></i>
                View Cart ({cart.length})
              </button>
            )}
            {filteredProducts.length > 0 ? (
              <ProductList
                products={filteredProducts.map((p) => ({
                  ...p,
                  quantity:
                    originalQuantities[p.id] -
                    (cart.find((cp) => cp.id === p.id)?.quantity || 0),
                }))}
                addToCart={addToCart}
                onProductClick={handleProductClick}
              />
            ) : (
              <div className="text-center mt-5">
                <h3>Sorry, we're currently not serving any items.</h3>
                <p className="text-muted">Please check back later or contact <a className="text-decoration-none" href="Shivendratripathi287@gmail.com">maintainer</a>!</p>
              </div>
            )}
            <CartModal
              show={showCartModal}
              handleClose={() => setShowCartModal(false)}
              cart={cart}
              incrementQuantity={incrementQuantity}
              decrementQuantity={decrementQuantity}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              calculateTotal={calculateTotal}
              checkout={checkout}
            />
            <ProductDetailModal
              show={showProductDetailModal}
              handleClose={() => setShowProductDetailModal(false)}
              product={selectedProduct}
              addToCart={addToCart}
            />
            <Toast
              show={showCheckoutToast}
              onClose={() => setShowCheckoutToast(false)}
              className="position-fixed bottom-0 end-0 m-3"
              delay={3000}
              autohide
            >
              <Toast.Body>Checkout successful!</Toast.Body>
            </Toast>
          </>
        )}
      </Container>
      <Footer />

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Your Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formMobileNumber">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={initiatePayment}>
              Pay Now
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Home;
