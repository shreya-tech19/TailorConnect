import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import TailorCard from "../components/TailorCard";
import "./Home.css";

function Home() {
  const heroSlides = [
    {
      image: "/images/side.png",
      smallTitle: "✦ YOUR STYLE, OUR STITCHING",
      title: "Perfect Fit.",
      highlight: "Beautifully Stitched.",
      description:
        "Find trusted local tailors and get your clothes stitched exactly the way you want.",
      button: "Find Tailors",
    },
    {
      image: "/images/cutting.png",
      smallTitle: "✦ MADE FOR YOUR STYLE",
      title: "Your Fabric.",
      highlight: "Your Design.",
      description:
        "Choose your tailor, share your requirements, and create an outfit made just for you.",
      button: "Explore Tailors",
    },
    {
      image: "/images/sewing.png",
      smallTitle: "✦ CRAFTED WITH CARE",
      title: "Stitched With.",
      highlight: "Attention to Detail.",
      description:
        "From precise measurements to careful stitching, every detail matters.",
      button: "Start Stitching",
    },
    {
      image: "/images/designing.png",
      smallTitle: "✦ CREATE SOMETHING SPECIAL",
      title: "Bring Your.",
      highlight: "Ideas to Life.",
      description:
        "Share your design inspiration and let skilled tailors turn it into your perfect outfit.",
      button: "Find a Tailor",
    },
    {
      image: "/images/ready.png",
      smallTitle: "✦ FROM FABRIC TO FINISH",
      title: "Beautifully.",
      highlight: "Stitched for You.",
      description:
        "Track your stitching journey and receive your finished outfit through doorstep delivery.",
      button: "Get Started",
    },
  ];

  const reviews = [
    {
      text: "The stitching quality was excellent and the fitting was exactly what I wanted.",
      name: "Pavitra N.",
      city: "Thane",
    },
    {
      text: "Very professional service. I could easily share my requirements with the tailor.",
      name: "ShubhanShu S.",
      city: "Mumbai",
    },
    {
      text: "The tailor understood my design perfectly and delivered a beautiful finish.",
      name: "Akash N.",
      city: "Navi Mumbai",
    },
    {
      text: "The whole process was simple and convenient. I did not have to visit the shop repeatedly.",
      name: "Monika R.",
      city: "Mumbai",
    },
    {
      text: "Very polite and professional. The measurements and stitching were handled carefully.",
      name: "Ayushi J.",
      city: "Thane",
    },
    {
      text: "I liked how easy it was to explain the design and special instructions.",
      name: "Ravi K.",
      city: "Pune",
    },
    {
      text: "The stitching was neat and the garment was delivered in good condition.",
      name: "Ranjan P.",
      city: "Mumbai",
    },
    {
      text: "Finding a suitable tailor was much easier than searching through local shops.",
      name: "Sneha M.",
      city: "Nashik",
    },
    {
      text: "The tailor paid attention to small details and the final fitting looked great.",
      name: "Priya S.",
      city: "Nagpur",
    },
    {
      text: "I really liked the convenience of doorstep pickup and delivery.",
      name: "Neha K.",
      city: "Aurangabad",
    },
    {
      text: "My outfit turned out exactly like the reference design I shared.",
      name: "Kavita R.",
      city: "Kolhapur",
    },
    {
      text: "The experience was smooth from selecting the tailor to receiving the garment.",
      name: "Rahul P.",
      city: "Thane",
    },
    {
      text: "Good communication and careful stitching. I would definitely use the service again.",
      name: "Meera D.",
      city: "Mumbai",
    },
    {
      text: "The tailor paid attention to the measurements and the fitting was comfortable.",
      name: "Aditi V.",
      city: "Pune",
    },
    {
      text: "The design details were maintained very well during stitching.",
      name: "Sakshi T.",
      city: "Navi Mumbai",
    },
    {
      text: "A convenient way to connect with local tailoring professionals.",
      name: "Rohit S.",
      city: "Nagpur",
    },
    {
      text: "The finished garment looked clean and professionally stitched.",
      name: "Anjali P.",
      city: "Nashik",
    },
    {
      text: "I appreciated being able to track the progress of my stitching order.",
      name: "Pooja M.",
      city: "Thane",
    },
    {
      text: "The tailor was responsive and understood exactly what changes I wanted.",
      name: "Varun K.",
      city: "Mumbai",
    },
    {
      text: "Overall, the process felt much more convenient than traditional tailoring.",
      name: "Riya S.",
      city: "Pune",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [tailors, setTailors] = useState([]);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((previousSlide) =>
        previousSlide === heroSlides.length - 1
          ? 0
          : previousSlide + 1
      );
    }, 4500);

    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((previousSlide) =>
      previousSlide === heroSlides.length - 1
        ? 0
        : previousSlide + 1
    );
  };

  const previousSlide = () => {
    setCurrentSlide((previousSlide) =>
      previousSlide === 0
        ? heroSlides.length - 1
        : previousSlide - 1
    );
  };

  const slide = heroSlides[currentSlide];

  useEffect(() => {
    const fetchTailors = async () => {
      try {
        const response = await API.get("/tailors");
        setTailors(response.data);
      } catch (error) {
        console.error("Error fetching tailors:", error);
      }
    };

    fetchTailors();
  }, []);

  const scrollToTailors = () => {
    document
      .getElementById("tailors")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-page">

      {/* ================= HERO ================= */}

      <section className="hero-carousel">
        <div className="hero-slide">

          <img
            key={slide.image}
            src={slide.image}
            alt="TailorConnect stitching"
            className="hero-slide-image"
          />

          <div className="hero-overlay"></div>

          <button
            type="button"
            className="hero-arrow hero-arrow-left"
            onClick={previousSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>

          <button
            type="button"
            className="hero-arrow hero-arrow-right"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ›
          </button>

          <div className="hero-carousel-content">

            <p className="hero-carousel-small-title">
              {slide.smallTitle}
            </p>

            <h1>
              {slide.title}
              <br />
              <span>{slide.highlight}</span>
            </h1>

            <p className="hero-carousel-description">
              {slide.description}
            </p>

            <Link
              to="/find-tailor"
              className="hero-carousel-button"
            >
              {slide.button}
            </Link>

          </div>

          <div className="hero-dots">

            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`hero-dot ${
                  currentSlide === index ? "active" : ""
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}

          </div>

        </div>
      </section>


      {/* ================= EXPLORE TAILORING ================= */}

      <section className="explore-section">

        <div className="section-heading">

          <span className="section-label">
            EXPLORE TAILORING
          </span>

          <h2>
            Find What You're <span>Looking For</span>
          </h2>

          <p>
            Explore tailoring services for every occasion, style and age.
          </p>

        </div>


        <div className="explore-category-grid">

          <Link
            to="/find-tailor"
            className="explore-category-card"
          >
            <div className="explore-icon">
              👔
            </div>

            <div>
              <h3>Men</h3>
              <p>
                Shirts, suits, trousers, kurtas and more
              </p>
            </div>

            <span className="explore-arrow">
              →
            </span>
          </Link>


          <Link
            to="/find-tailor"
            className="explore-category-card"
          >
            <div className="explore-icon">
              👗
            </div>

            <div>
              <h3>Women</h3>
              <p>
                Blouses, dresses, suits, lehengas and more
              </p>
            </div>

            <span className="explore-arrow">
              →
            </span>
          </Link>


          <Link
            to="/find-tailor"
            className="explore-category-card"
          >
            <div className="explore-icon">
              🧒
            </div>

            <div>
              <h3>Kids</h3>
              <p>
                School wear, ethnic wear and party outfits
              </p>
            </div>

            <span className="explore-arrow">
              →
            </span>
          </Link>

        </div>


        <div className="popular-services">

          <h3>
            Popular Stitching Services
          </h3>

          <div className="service-pills">

            <Link to="/find-tailor">
              Wedding Wear
            </Link>

            <Link to="/find-tailor">
              Formal Wear
            </Link>

            <Link to="/find-tailor">
              Ethnic Wear
            </Link>

            <Link to="/find-tailor">
              Daily Wear
            </Link>

            <Link to="/find-tailor">
              Kids Wear
            </Link>

            <Link to="/find-tailor">
              Alterations
            </Link>

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}

      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-heading">

          <span className="section-label">
            SIMPLE PROCESS
          </span>

          <h2>
            How <span>TailorConnect</span> Works
          </h2>

          <p>
            From selecting a tailor to receiving your finished garment,
            everything is simple and transparent.
          </p>

        </div>


        <div className="steps-container">

          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">⌕</div>

            <h3>Find a Tailor</h3>

            <p>
              Browse verified tailors near your location.
            </p>
          </div>


          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">✂</div>

            <h3>Choose Your Design</h3>

            <p>
              Select a garment and share your preferred design.
            </p>
          </div>


          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">📏</div>

            <h3>Submit Measurements</h3>

            <p>
              Provide your measurements or request assistance.
            </p>
          </div>


          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-icon">⌂</div>

            <h3>Pickup & Stitching</h3>

            <p>
              Your garment is picked up and stitched by the tailor.
            </p>
          </div>


          <div className="step-card">
            <div className="step-number">05</div>
            <div className="step-icon">✓</div>

            <h3>Get Your Garment</h3>

            <p>
              Track your order and receive the finished garment.
            </p>
          </div>

        </div>

      </section>


      {/* ================= FEATURED TAILORS ================= */}

      <section
        className="tailor-section"
        id="tailors"
      >

        <div className="section-heading">

          <span className="section-label">
            FEATURED TAILORS
          </span>

          <h2>
            Meet Tailors <span>You Can Trust</span>
          </h2>

          <p>
            Discover verified tailoring professionals from our growing
            network and explore their stitching services.
          </p>

        </div>


        <div className="tailor-list">

          {tailors.length > 0 ? (

            tailors
              .slice(0, 4)
              .map((tailor) => (
                <TailorCard
                  key={tailor._id || tailor.id}
                  tailor={tailor}
                />
              ))

          ) : (

            <div className="no-tailors">
              No tailors available right now.
            </div>

          )}

        </div>


        {tailors.length > 4 && (

          <div className="featured-tailors-action">

            <Link
              to="/find-tailor"
              className="view-all-tailors-btn"
            >
              Explore All Tailors
              <span>→</span>
            </Link>

          </div>

        )}

      </section>


      {/* ================= CUSTOMER REVIEWS ================= */}

      <section className="reviews-section">

        <div className="section-heading reviews-heading">

          <span className="section-label">
            CUSTOMER REVIEWS
          </span>

          <h2>
            What Our <span>Customers Say</span>
          </h2>

          <p>
            Hear from customers about their tailoring experience.
          </p>

        </div>


        <div className="reviews-slider">

          {/* ROW 1 — MOVES LEFT */}

          <div className="review-row">

            <div className="review-track review-track-left">

              {[...reviews.slice(0, 10), ...reviews.slice(0, 10)].map(
                (review, index) => (

                  <article
                    className="review-card"
                    key={`left-${index}`}
                  >

                    <div className="review-stars">
                      ★★★★★
                    </div>

                    <p className="review-text">
                      “{review.text}”
                    </p>

                    <div className="review-author">

                      <strong>
                        {review.name}
                      </strong>

                      <span>
                        {review.city}
                      </span>

                    </div>

                  </article>

                )
              )}

            </div>

          </div>


          {/* ROW 2 — MOVES RIGHT */}

          <div className="review-row">

            <div className="review-track review-track-right">

              {[...reviews.slice(10, 20), ...reviews.slice(10, 20)].map(
                (review, index) => (

                  <article
                    className="review-card"
                    key={`right-${index}`}
                  >

                    <div className="review-stars">
                      ★★★★★
                    </div>

                    <p className="review-text">
                      “{review.text}”
                    </p>

                    <div className="review-author">

                      <strong>
                        {review.name}
                      </strong>

                      <span>
                        {review.city}
                      </span>

                    </div>

                  </article>

                )
              )}

            </div>

          </div>

        </div>

      </section>


      {/* ================= WHY TAILORCONNECT ================= */}

      <section className="why-section">

        <div className="section-heading">

          <span className="section-label">
            WHY TAILORCONNECT
          </span>

          <h2>
            Traditional Tailoring,
            <span> Made Easier</span>
          </h2>

          <p>
            Everything you need for a smoother and more convenient
            stitching experience.
          </p>

        </div>


        <div className="why-grid">

          <div className="why-card">

            <div className="why-icon">
              ✓
            </div>

            <h3>
              Verified Tailors
            </h3>

            <p>
              Discover verified tailoring professionals and explore
              their profiles before placing an order.
            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">
              ⌂
            </div>

            <h3>
              Doorstep Pickup
            </h3>

            <p>
              Your garments can be collected and returned through
              convenient doorstep logistics.
            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">
              ◷
            </div>

            <h3>
              Order Tracking
            </h3>

            <p>
              Follow your stitching order from submission through
              completion and delivery.
            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">
              ₹
            </div>

            <h3>
              Transparent Process
            </h3>

            <p>
              View your stitching requirements and receive pricing
              information before confirming the order.
            </p>

          </div>

        </div>

      </section>


      {/* ================= STATS ================= */}

      <section className="stats-section">

        <div className="stat-item">
          <strong>150+</strong>
          <span>Verified Tailors</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <strong>2,500+</strong>
          <span>Stitching Orders</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <strong>5,000+</strong>
          <span>Happy Customers</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <strong>4.8/5</strong>
          <span>Customer Rating</span>
        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="home-footer" id="contact">

        <div className="footer-main">

          {/* BRAND */}

          <div className="footer-brand">

            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">✂</span>
              TailorConnect
            </Link>

            <p className="footer-description">
              Connecting customers with trusted local tailors
              and making custom stitching simple, transparent
              and convenient.
            </p>

            <div className="footer-tagline">
              Your style. Your measurements. Your tailor.
            </div>

          </div>


          {/* QUICK LINKS */}

          <div className="footer-column">

            <h3>Quick Links</h3>

            <Link to="/">
              Home
            </Link>

            <a href="#how-it-works">
              How It Works
            </a>

            <a href="#tailors">
              Featured Tailors
            </a>

            <a href="#contact">
              Contact
            </a>

          </div>


          {/* FOR CUSTOMERS */}

          <div className="footer-column">

            <h3>For Customers</h3>

            <Link to="/register">
              Create Account
            </Link>

            <Link to="/login">
              Customer Login
            </Link>

            <Link to="/orders">
              My Orders
            </Link>

            <Link to="/find-tailor">
              Browse Tailors
            </Link>

            <a href="#how-it-works">
              How Stitching Works
            </a>

          </div>


          {/* FOR TAILORS */}

          <div className="footer-column">

            <h3>For Tailors</h3>

            <Link to="/tailor-register">
              Join as a Tailor
            </Link>

            <Link to="/tailor-login">
              Tailor Login
            </Link>

            <a href="#contact">
              Partner With Us
            </a>

          </div>


          {/* SUPPORT */}

          <div className="footer-column footer-contact">

            <h3>Need Help?</h3>

            <p>
              Have a question about your stitching order?
              We're here to help.
            </p>

            <a href="mailto:support@tailorconnect.com">
              support@tailorconnect.com
            </a>

            <div className="footer-contact-item">

              <span>⌂</span>

              <div>

                <strong>Service Area</strong>

                <small>
                  Local tailoring & doorstep service
                </small>

              </div>

            </div>

          </div>

        </div>


        {/* FOOTER HIGHLIGHT */}

        <div className="footer-highlight">

          <div>

            <strong>
              Looking for the perfect fit?
            </strong>

            <span>
              Discover verified tailors and start your stitching order today.
            </span>

          </div>

          <button onClick={scrollToTailors}>
            Find Your Tailor →
          </button>

        </div>


        {/* FOOTER BOTTOM */}

        <div className="footer-bottom">

          <p>
            © 2026 TailorConnect. All rights reserved.
          </p>

          <div className="footer-legal">

            <a href="#contact">
              Privacy Policy
            </a>

            <a href="#contact">
              Terms & Conditions
            </a>

            <a href="#contact">
              Support
            </a>

          </div>

          <p className="footer-made">
            Made for better tailoring experiences.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;