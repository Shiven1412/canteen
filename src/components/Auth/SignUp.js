import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Card, Form, Button, Alert, Container } from "react-bootstrap";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [splitEmail, setSplitEmail] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setSplitEmail(e.target.value.split("@")[0] || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Failed to create an account: " + err.message);
    }
    setLoading(false);
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
      }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card className="rounded-4 shadow-lg">
          <Card.Body>
            <div className="text-center mb-4">
              <img
                src="https://play-lh.googleusercontent.com/3uA4VowYRVCylWTkUW0i7h_NQD9DwMcu2YxfIT1ppRW6YYSSbg31DWiKmQaJ8kivfYk=w480-h960-rw" // Replace with your logo path
                alt="Website Logo"
                style={{ width: "80px", height: "80px" }}
              />
              <h1 className="fw-bold mt-3" style={{ color: "#6a11cb" }}>
                ACOE Canteen
              </h1>
            </div>
            <h2 className="mb-4 fw-bold text-center">Sign Up</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              {email && (
                <div className="d-flex justify-content-center mb-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${splitEmail}&background=random`}
                    alt="profile"
                    className="rounded-circle"
                    width="100"
                    height="100"
                  />
                </div>
              )}
              <Form.Group id="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="rounded-3"
                />
              </Form.Group>
              <Form.Group id="password" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-3"
                />
              </Form.Group>
              <Button
                disabled={loading}
                className="w-100 rounded-4"
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                  border: "none",
                }}
              >
                Sign Up
              </Button>
            </Form>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-3 text-white">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-none fw-bold text-white">
            Log In
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default SignUp;
