import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function TailorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(
        "/tailors/register",
        formData
      );

      alert(
        response.data.message ||
        "Tailor registration successful!"
      );

      navigate("/tailor-login");

    } catch (error) {
      console.log("TAILOR REGISTER ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Tailor registration failed"
      );
    }
  };

  return (
    <div className="register-container">

      <div className="register-card">

        <h2>Register as a Tailor</h2>

        <p>
          Create your tailor account to manage your
          services and receive stitching orders.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="shopName"
            placeholder="Shop Name"
            value={formData.shopName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="ownerName"
            placeholder="Owner Name"
            value={formData.ownerName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Register as Tailor
          </button>

        </form>

        <p>
          Already have a tailor account?
          <Link to="/tailor-login">
            {" "}Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default TailorRegister;
