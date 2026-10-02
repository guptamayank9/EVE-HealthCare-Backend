const pool = require("../db/db");

const createBooking = async (req, res) => {
  try {
    const userId = req.userId;

    const { test_id, centre_id, appointment_date } = req.body;

    if (!test_id || !centre_id || !appointment_date) {
      return res.status(400).json({
        message: "test_id, centre_id and appointment_date are required",
      });
    }
    //check test
    const testResult = await pool.query(
      `SELECT id ,name, price, centre_id
            FROM diagnostic_tests
            WHERE id =$1`,
      [test_id],
    );

    if (testResult.rows.length === 0) {
      return res.status(404).json({
        message: "Diagnostic test not found",
      });
    }

    const test = testResult.rows[0];

    //make sure selected centre actually owns this exists
    if (Number(test.centre_id) !== Number(centre_id)) {
      return res.status(400).json({
        message: "Selected test does not belong to this centre",
      });
    }
    //check centre
    const centreResult = await pool.query(
      `SELECT id, name, location
            FROM diagnostic_centres
            WHERE id = $1`,
      [centre_id],
    );

    if (centreResult.rows.length === 0) {
      return res.status(404).json({
        message: "Diagnostic centre not found",
      });
    }

    //create booking
    const result = await pool.query(
      `INSERT INTO bookings
             (user_id, test_id, centre_id, appointment_date, amount, status)
           VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
      [userId, test_id, centre_id, appointment_date, test.price, "PENDING"],
    );
    res.status(201).json({
      message: "Booking created successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getMyBookings = async (req,res) => {
    try {
      const userId = req.userId;

      const result = await pool.query
      (`SELECT b.id,
        b.appointment_date,
        b.amount,
        b.status,
        b.created_at,

        t.name AS test_name,
        c.name AS centre_name,
        c.location AS centre_location

        FROM bookings b

        JOIN diagnostic_tests t
         ON b.test_id = t.id

        JOIN diagnostic_centres c
         ON b.centre_id = c.id

        WHERE b.user_id = $1

        order BY b.id DESC`
        [userId]
      );

      res.json({
        bookings:result.rows,
      });
        
    } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
        
    }
}
//getone booking
const getBookingById = async (req,res) => {
  try {
    
    const userId = req.userId;
    const {id} = req.params;

    const result = await pool.query(
      `SELECT
        b.id,
        b.appointment_date,
        b.amount,
        b.status,
        b.created_at,

        t.name AS test_name,
        c.name AS centre_name,
        c.location AS centre_location

       FROM bookings b

       JOIN diagnostic_tests t
         ON b.test_id = t.id

       JOIN diagnostic_centres c
         ON b.centre_id = c.id

      WHERE b.id = $1
       AND b.user_id = $2`,
       [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json({
      booking: result.rows[0],
    });




  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports={
  getMyBookings,getBookingById,createBooking,
}
