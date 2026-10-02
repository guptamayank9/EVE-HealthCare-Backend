const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/db");


const signup = async (req, res) => {

    try {
        const {name,email, password} =req.body;

        //basic validation
        if(!name || !email || !password){
            return res.status(400).json({
                message:"Name, email and passwords are required",
            });
        }

        if(password.length <6){
            return res.status(400).json({
                message:"Password must be at least 6 characters",
            });
        }

        //check if user already exists
        const existingUser = await pool.query(
            "Select id FROM users WHERE email = $1",
            [email]
        );

        if(existingUser.rows.length > 0){
            return res.status(409).json({
                messages:"User already exists",
            });
        }

        //hash passwords
        const hashedPassword = await bcrypt.hash(password,10);

        //create user
        const result = await pool.query(
          `INSERT INTO users (name, email, password)
           VALUES ($1, $2, $3)
           RETURNING id, name, email, created_at`,
           [name,email,hashedPassword]
        );

        res.status(201).json({
            message:"User registered Successfully",
            user: result.rows[0],
        });
        
    } catch (error) {
        console.error(error);
       res.status(500).json({
         message: "Server error",
    });
        
    }
}
const login = async (req,res) => {

    try {
      
        const {email, password} = req.body;

        if(!email || !password) {
          return res.status(400).json({
            message:"Email and Passwords are required",
          });
        }

        //find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",[email]
        );

        if(result.rows.length === 0){
            return res.status(401).json({
                message:"Invalid email or password",
            });
        }

        const user = result.rows[0];

        //compare psswrds
        const passwordMatch = await bcrypt.compare(password,user.password);

        if(!passwordMatch){
            return res.status(401).json({
                message:"Invalid email or password",
            });
        }

        const token = jwt.sign({userId:user.id,},process.env.JWT_SECRET,{expiresIn: "1d",});

        res.json({
            message:"Login Successful",
            token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
            },
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
         message: "Server error",
     });
    }
}

module.exports={
    signup,
    login,
}