import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import Payment from "./components/payment";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import OrderBill from "./components/OrderBill/OrderBill"; // Import the new component
import UserOrderHistory from "./components/Home/UserOrderHistory"; // Import the My Orders component

const App = () => {
  return (
    <Router basename="/Canteen-Management">
      <AuthProvider>
        <Routes>
          <Route 
            path="/" 
            element={
                <Home />            } 
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <UserOrderHistory />
              </ProtectedRoute>
            } 
          /> {/* Restrict access to My Orders */}
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-bill" element={<OrderBill />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;