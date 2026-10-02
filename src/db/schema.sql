CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE diagnostic_centres(
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(225) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE diagnostic_tests(
   id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    centre_id INTEGER NOT NULL,

    CONSTRAINT fk_test_centre
        FOREIGN KEY (centre_id)
        REFERENCES diagnostic_centres(id)
        ON DELETE CASCADE

);
CREATE TABLE bookings(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    centre_id INTEGER NOT NULL,

    appointment_date TIMESTAMP NOT NULL,
    
    amount DECIMAL(10,2) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
      FOREIGN KEY (user_id)
      REFERENCES users(id),

    CONSTRAINT fk_booking_test
        FOREIGN KEY (test_id)
        REFERENCES diagnostic_tests(id),

    CONSTRAINT fk_booking_centre
        FOREIGN KEY (centre_id)
        REFERENCES diagnostic_centres(id)    
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,

    booking_id INTEGER NOT NULL,

    event_id VARCHAR(255) UNIQUE NOT NULL,

    amount  DECIMAL(10,2) NOT NULL,

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

     CONSTRAINT fk_payment_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
);
