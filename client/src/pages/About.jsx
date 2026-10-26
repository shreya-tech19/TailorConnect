import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* ================= INTRO ================= */}

      <section className="about-intro">

        <div className="about-intro-inner">

          <div className="about-intro-title">
            <span>ABOUT TAILORCONNECT</span>

            <h1>
              Redefining convenience for
              <strong> custom stitching</strong>
            </h1>
          </div>

          <div className="about-intro-content">

            <p>
              TailorConnect is a web-based platform that connects
              customers with verified local tailors and makes custom
              stitching easier, more transparent and convenient.
            </p>

            <p>
              Customers can discover tailors, explore their services,
              share designs and measurements, place stitching orders
              and track the progress of their garments.
            </p>

            <p>
              Our platform brings customers, tailors and logistics
              partners together to create a smoother tailoring
              experience from order placement to doorstep delivery.
            </p>

          </div>

        </div>

      </section>


      {/* ================= PURPOSE ================= */}

      <section className="about-purpose">

        <div className="purpose-icon">
          ✂
        </div>

        <span className="section-label">
          OUR PURPOSE
        </span>

        <h2>
          Making Custom Tailoring
          <span> Simpler</span>
        </h2>

        <p>
          To make personalized tailoring more accessible by connecting
          customers with skilled local tailors and simplifying the
          complete stitching journey.
        </p>

      </section>


      {/* ================= PROBLEM ================= */}

      <section className="about-problem">

        <div className="about-section-heading">

          <span className="section-label">
            THE CHALLENGE
          </span>

          <h2>
            Traditional Tailoring Can Be
            <span> Time-Consuming</span>
          </h2>

          <p>
            Customers often face several difficulties when using
            traditional tailoring services.
          </p>

        </div>


        <div className="about-feature-grid">

          <div className="about-feature-card">

            <div className="about-card-icon">
              ⌕
            </div>

            <h3>Finding the Right Tailor</h3>

            <p>
              It can be difficult to discover reliable and skilled
              tailors nearby.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-card-icon">
              📏
            </div>

            <h3>Repeated Visits</h3>

            <p>
              Measurements, fabric submission and garment collection
              may require multiple shop visits.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-card-icon">
              💬
            </div>

            <h3>Limited Transparency</h3>

            <p>
              Customers may not have a simple way to compare services,
              prices or stitching progress.
            </p>

          </div>

        </div>

      </section>


      {/* ================= SOLUTION ================= */}

      <section className="about-solution">

        <div className="about-section-heading">

          <span className="section-label">
            OUR SOLUTION
          </span>

          <h2>
            Your Requirements Matter.
            <span> Every Detail Counts.</span>
          </h2>

          <p>
            TailorConnect brings important parts of the tailoring
            process together in one convenient platform.
          </p>

        </div>


        <div className="about-feature-grid three-columns">

          <div className="about-feature-card">

            <div className="about-card-icon">
              ✓
            </div>

            <h3>Verified Tailors</h3>

            <p>
              Discover local tailoring professionals with profiles,
              services, experience and portfolios.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-card-icon">
              🎨
            </div>

            <h3>Design Freedom</h3>

            <p>
              Share your preferred design, reference image, fabric
              details and special stitching requirements.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-card-icon">
              💰
            </div>

            <h3>Transparent Pricing</h3>

            <p>
              The tailor reviews the requirements and provides the
              stitching price before the customer proceeds.
            </p>

          </div>

        </div>

      </section>


      {/* ================= CUSTOMER EXPERIENCE ================= */}

      <section className="about-customer">

        <div className="about-section-heading">

          <span className="section-label">
            CUSTOMER EXPERIENCE
          </span>

          <h2>
            From Your Idea
            <span> To Your Finished Garment</span>
          </h2>

        </div>


        <div className="about-journey">

          <div className="journey-item">

            <span>01</span>

            <h3>Choose a Tailor</h3>

            <p>
              Explore verified tailors and their stitching services.
            </p>

          </div>


          <div className="journey-line"></div>


          <div className="journey-item">

            <span>02</span>

            <h3>Share Requirements</h3>

            <p>
              Provide design, fabric and measurement details.
            </p>

          </div>


          <div className="journey-line"></div>


          <div className="journey-item">

            <span>03</span>

            <h3>Confirm & Stitch</h3>

            <p>
              Review the price, confirm the order and begin stitching.
            </p>

          </div>


          <div className="journey-line"></div>


          <div className="journey-item">

            <span>04</span>

            <h3>Pickup & Delivery</h3>

            <p>
              Track the order and receive your finished garment.
            </p>

          </div>

        </div>

      </section>


      {/* ================= TRUST ================= */}

      <section className="about-trust">

        <div className="about-section-heading">

          <span className="section-label">
            WHY TAILORCONNECT
          </span>

          <h2>
            Built Around a
            <span> Better Tailoring Experience</span>
          </h2>

        </div>


        <div className="about-trust-grid">

          <div className="trust-card">

            <div className="trust-icon">
              ✓
            </div>

            <div>
              <h3>Verified Professionals</h3>
              <p>
                Connect with verified local tailoring professionals.
              </p>
            </div>

          </div>


          <div className="trust-card">

            <div className="trust-icon">
              📍
            </div>

            <div>
              <h3>Local Discovery</h3>
              <p>
                Find tailoring services available in your area.
              </p>
            </div>

          </div>


          <div className="trust-card">

            <div className="trust-icon">
              📦
            </div>

            <div>
              <h3>Doorstep Convenience</h3>
              <p>
                Simplify garment pickup and delivery through the platform.
              </p>
            </div>

          </div>


          <div className="trust-card">

            <div className="trust-icon">
              ⭐
            </div>

            <div>
              <h3>Customer Reviews</h3>
              <p>
                Share experiences and help customers discover trusted
                tailors.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="about-cta">

        <div>

          <span className="section-label">
            GET STARTED
          </span>

          <h2>
            Looking for a tailor for your
            <span> next outfit?</span>
          </h2>

          <p>
            Explore verified tailors and discover stitching services
            available near you.
          </p>

        </div>

        <Link
          to="/find-tailor"
          className="about-cta-button"
        >
          Find a Tailor →
        </Link>

      </section>

    </div>
  );
}

export default About;