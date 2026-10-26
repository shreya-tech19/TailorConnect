# TailorConnect — Online Tailor Booking and Stitching Management System

TailorConnect is a full-stack web application that connects customers with tailors for custom stitching services. It supports tailor discovery, design portfolios, stitching order management, quotations, online payments, and delivery tracking.

## Features

- Customer registration and login
- Tailor profiles, portfolios, and design discovery
- Search for tailors
- Custom stitching order placement
- Tailor quotations and customer confirmation
- Razorpay payment integration
- Order status tracking
- Delivery partner dashboard
- Delivery OTP verification
- Admin dashboard and verification workflows, where implemented

## Technology Stack

- **Frontend:** React.js, Vite, HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT, bcrypt
- **Image storage:** Cloudinary
- **Payment gateway:** Razorpay

## Project Structure

```text
TailorConnect/
├── client/   # React frontend
├── server/   # Express backend and APIs
└── README.md
```

## Local Setup

### Prerequisites

- Node.js and npm
- MongoDB connection
- Cloudinary credentials, if using image uploads
- Razorpay credentials for payment testing

### Install dependencies

Frontend:

```bash
cd client
npm install
```

Backend, in a separate terminal:

```bash
cd server
npm install
```

### Configure environment variables

Create the required `.env` file in the backend directory using the variable names expected by the server code. Keep real credentials private and never commit them to GitHub.

### Run the application

Start the backend using the script defined in `server/package.json`, then start the frontend using the script defined in `client/package.json`.

Open the local URL displayed by Vite.

## Project Purpose

Developed as a final-year BSc IT project to demonstrate full-stack web development, database integration, authentication, payment processing, and service
