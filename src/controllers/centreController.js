const pool = require('../db/db');

const createCentre = async (req,res) => {
    try {

        const {name,location} = req.body;

        if(!name || !location){
            return res.status(400).json({
              message:"Name and location are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO diagnostic_centres(name, location)
            VALUES ($1,$2)
            RETURNING *`,
            [name,location]

        );
        res.status(201).json({
          message:"Diagnostic centre created successfully",
          centre:result.rows[0],
        });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server Error"
        });
    }
}
const getCentres = async (req,res) => {
  
    try {

        const result = await pool.query(
             `SELECT *
              FROM diagnostic_centres
              ORDER BY id DESC`
        );
        res.json({
            centres:result.rows,
        });
        
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server Error"
        })
    }
    
}
module.exports={
    createCentre,getCentres
}