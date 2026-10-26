import "./Register.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function Register() {

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        city: "",
        pincode: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await API.post(
                "/customers/register",
                formData
            );
    
            alert(response.data.message);
    
            console.log(response.data);
    
        } catch (error) {
            console.log("ERROR:", error);
            console.log("RESPONSE:", error.response);
            console.log("DATA:", error.response?.data);
        
            alert(error.response?.data?.message || "Registration Failed");
        }
    };

    
    return (

        <div className="register-container">

            <div className="register-card">

                <h2>Create Account</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        onChange={handleChange}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                    />
                    <input
    type="text"
    name="phone"
    placeholder="Phone Number"
    onChange={handleChange}
/>

<input
    type="text"
    name="address"
    placeholder="Address"
    onChange={handleChange}
/>

<input
    type="text"
    name="city"
    placeholder="City"
    onChange={handleChange}
/>

<input
    type="text"
    name="pincode"
    placeholder="Pincode"
    onChange={handleChange}
/>
                    


                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                    />

                    <button type="submit">
                        Register
                    </button>

                </form>

                <p>
                    Already have an account?
                    <Link to="/login"> Login</Link>
                </p>

            </div>

        </div>

    );
}

export default Register;