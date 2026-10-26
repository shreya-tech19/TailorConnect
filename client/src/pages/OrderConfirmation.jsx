import "./OrderConfirmation.css";
import { Link } from "react-router-dom";

function OrderConfirmation() {
  return (
    <div className="confirmation-page">
      <div className="confirmation-card">

        <div className="confirmation-icon">
          ✓
        </div>

        <p className="confirmation-label">
          STITCHING REQUEST SUBMITTED
        </p>

        <h1>
          Your Stitching Request is on its Way!
        </h1>

        <p className="confirmation-message">
          Your request has been submitted successfully.
          The selected tailor will review your stitching
          requirements and update the order status.
        </p>

        <div className="confirmation-info">

          <div className="info-item">
            <span>📋</span>
            <div>
              <strong>Request Submitted</strong>
              <p>Your stitching request has been received.</p>
            </div>
          </div>

          <div className="info-item">
            <span>✂️</span>
            <div>
              <strong>Tailor Review</strong>
              <p>
                The tailor will review your design,
                measurements and requirements.
              </p>
            </div>
          </div>

          <div className="info-item">
            <span>🚚</span>
            <div>
              <strong>Pickup & Stitching</strong>
              <p>
                Once approved, pickup and stitching
                will proceed according to your order.
              </p>
            </div>
          </div>

        </div>

        <div className="confirmation-actions">

          <Link
            to="/orders"
            className="primary-confirmation-btn"
          >
            View My Orders
          </Link>

          <Link
            to="/"
            className="secondary-confirmation-btn"
          >
            Back to Home
          </Link>

        </div>

      </div>
    </div>
  );
}

export default OrderConfirmation;