import "./CustomerDashboard.css";
import { useEffect, useState } from "react";
import API from "../services/api";

function CustomerDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dashboard">

      <h1>My Appointments</h1>

      <div className="order-list">

        {orders.map((order) => (

          <div className="order-card" key={order._id}>

            <h2>{order.tailor.shopName}</h2>

            <p>
              <strong>Customer:</strong> {order.customerName}
            </p>

            <p>
              <strong>Phone:</strong> {order.phone}
            </p>

            <p>
              <strong>Service:</strong> {order.service}
            </p>

            <p>
              <strong>Pickup Date:</strong> {order.pickupDate}
            </p>

            <p>
              <strong>Status:</strong>

              <span className="status">
                {order.status}
              </span>

            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default CustomerDashboard;