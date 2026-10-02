const express = require('express');
const cors = require('cors');
const pool = require('./db/db');

const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const centreRoutes = require('./routes/centreRoutes');
const testRoutes = require('./routes/testRoutes');
const bookingRoutes =require('./routes/bookingRoutes');
const paymentRoutes = require("./routes/paymentRoutes");
const app = express();


app.use(cors());
app.use(express.json());

app.get('/', async (req,res)=>{
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message:"EVE HealthCare API is Running",
            database:"Connected",
               time: result.rows[0].now,

        });
        
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:"DataBase Connection Failed"
        })
        
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/centres",centreRoutes);
app.use("/api/tests",testRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// app.get("/api/protected",authMiddleware,(req,res)=>{
//     res.json({
//         message:"You can access this protected route",
//         userId:req.userId,
//     })
// })

module.exports = app;