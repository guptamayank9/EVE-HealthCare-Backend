Haan bhai. README **simple but professional** rakhenge. Assignment ke required points cover ho jayenge: setup, API endpoints, database design, payment/webhook flow, assumptions aur future improvements. 

Apne `README.md` me **ye pura paste kar de**:

````md
# EVE Healthcare Backend

Backend engineering assignment for EVE Healthcare.

This project provides APIs for user authentication, diagnostic centres, diagnostic tests, test bookings, simulated payments, and payment webhooks.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcryptjs
- pg (node-postgres)
- dotenv

## Features

- User Signup
- User Login
- Password hashing using bcrypt
- JWT based authentication
- Diagnostic centre management
- Diagnostic test management
- Test booking
- Booking ownership validation
- Simulated payment processing
- SUCCESS / FAILED payment handling
- Payment webhook
- Idempotent webhook handling
- PostgreSQL relational database

---

## Project Structure

```text
Backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── centreController.js
│   │   ├── testController.js
│   │   ├── bookingController.js
│   │   └── paymentController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── centreRoutes.js
│   │   ├── testRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── paymentRoutes.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   └── db/
│       ├── db.js
│       └── schema.sql
│
├── server.js
├── package.json
├── .env
└── README.md
````

---

# Setup Instructions

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Backend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create PostgreSQL Database

Create a PostgreSQL database named:

```text
eve_healthcare
```

Then run the SQL queries from:

```text
src/db/schema.sql
```

to create the required tables.

## 4. Configure Environment Variables

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/eve_healthcare

JWT_SECRET=your_secret_key
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

Do not commit `.env` to GitHub.

## 5. Start the server

Development:

```bash
npm run dev
```

Or:

```bash
node server.js
```

Server runs at:

```text
http://localhost:5000
```

---

# API Endpoints

## Authentication

### Signup

```http
POST /api/auth/signup
```

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Login returns a JWT token.

Use the token for protected endpoints:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# Diagnostic Centres

### Create Centre

```http
POST /api/centres
```

Authentication required.

Request:

```json
{
  "name": "Apollo Diagnostic Centre",
  "location": "Bhopal"
}
```

### Get All Centres

```http
GET /api/centres
```

---

# Diagnostic Tests

### Create Test

```http
POST /api/tests
```

Authentication required.

Request:

```json
{
  "name": "CBC Test",
  "price": 300,
  "centre_id": 1
}
```

### Get All Tests

```http
GET /api/tests
```

### Get Tests By Centre

```http
GET /api/tests/centre/:centreId
```

---

# Bookings

### Create Booking

```http
POST /api/bookings
```

Authentication required.

Request:

```json
{
  "test_id": 1,
  "centre_id": 1,
  "appointment_date": "2026-10-10T10:00:00"
}
```

The booking amount is taken from the selected diagnostic test instead of trusting the client-provided amount.

Initial booking status:

```text
PENDING
```

### Get My Bookings

```http
GET /api/bookings/my
```

Authentication required.

### Get Booking By ID

```http
GET /api/bookings/:id
```

Authentication required.

Users can only access their own bookings.

---

# Payments

Payments are simulated. No real payment gateway is used.

### Create Payment

```http
POST /api/payments
```

Authentication required.

Request:

```json
{
  "booking_id": 1,
  "result": "SUCCESS"
}
```

Supported results:

```text
SUCCESS
FAILED
```

Booking status changes to:

```text
SUCCESS → CONFIRMED
FAILED  → FAILED
```

---

# Payment Webhook

### Webhook

```http
POST /api/payments/webhook
```

Request:

```json
{
  "event_id": "payment-event-001",
  "booking_id": 1,
  "amount": 300,
  "status": "SUCCESS"
}
```

The webhook validates the booking and payment amount before updating the booking.

## Idempotency

Each webhook contains a unique `event_id`.

The `payments.event_id` column has a UNIQUE constraint.

If the same webhook event is received again, it is not processed twice.

Example response:

```json
{
  "message": "Webhook already processed"
}
```

---

# Database Design

The application uses PostgreSQL with the following main tables:

### users

Stores registered users.

```text
id
name
email
password
created_at
```

### diagnostic_centres

Stores diagnostic centre information.

```text
id
name
location
created_at
```

### diagnostic_tests

Stores tests offered by diagnostic centres.

```text
id
name
price
centre_id
```

### bookings

Stores user test bookings.

```text
id
user_id
test_id
centre_id
appointment_date
amount
status
created_at
```

### payments

Stores simulated payment records.

```text
id
booking_id
event_id
amount
status
created_at
```

---

# Booking Flow

```text
User Signup
     ↓
User Login
     ↓
JWT Token
     ↓
Select Diagnostic Centre
     ↓
Select Diagnostic Test
     ↓
Create Booking
     ↓
PENDING
     ↓
Simulated Payment
     ↓
 ┌───────────┐
 │           │
SUCCESS     FAILED
 │           │
 ↓           ↓
CONFIRMED   FAILED
```

---

# Webhook Flow

```text
Payment Provider
       ↓
POST /api/payments/webhook
       ↓
Validate event_id
       ↓
Check duplicate event
       ↓
Validate booking
       ↓
Validate amount
       ↓
Create payment record
       ↓
Update booking status
```

---

# Error Handling

The API handles cases such as:

* Missing required fields
* Invalid login credentials
* Invalid or expired JWT
* Invalid booking ID
* Non-existing diagnostic test
* Non-existing diagnostic centre
* Test-centre mismatch
* Unauthorized booking access
* Invalid payment result
* Payment for an already processed booking
* Duplicate webhook events
* Payment amount mismatch

---

# Assumptions

* Payments are simulated and no real payment gateway is integrated.
* Users authenticate using JWT tokens.
* Booking amount is calculated from the selected diagnostic test.
* A booking starts with `PENDING` status.
* Successful payment changes booking status to `CONFIRMED`.
* Failed payment changes booking status to `FAILED`.
* Webhook events are uniquely identified using `event_id`.

---


# Author

Developed as part of the EVE Healthcare SDE Intern Backend Engineering Assignment.




