const pool = require('../db/db');

const createTest = async (req,res) => {
    try {

        const {name,price,centre_id} =req.body;

        if(!name || price === undefined || !centre_id){
             return res.status(400).json({
             message: "Name, price and centre_id are required",
            });
        }

        if(Number(price)<=0){
            return res.status(400).json({
                message:"Price must be greater than 0",
            });
        }

        const centre =  await pool.query(
            `SELECT id FROM diagnostic_centres WHERE id = $1`,
            [centre_id]
        );

        if(centre.rows.length === 0){
            return res.status(404).json({
                message:"Diagnostic centre not found",
            });
        }

        const result = await pool.query(
            `INSERT INTO diagnostic_tests(name,price, centre_id)
            VALUES  ($1,$2,$3)
            RETURNING *`,
        [name,price,centre_id]
    );

    res.status(201).json({
        message:"Diagnostic test created successfully",
        test:result.rows[0],
    });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server Error",
        });
    }
};

//get all tests
const getTests = async (req,res) => {

    try {

        const result = await pool.query(`
            SELECT 
            diagnostic_tests.id,
            diagnostic_tests.name,
            diagnostic_tests.price,
            diagnostic_centres.id AS centre_id,
            diagnostic_centres.name AS centre_name,
            diagnostic_centres.location
            FROM diagnostic_tests
            JOIN diagnostic_centres
            ON diagnostic_tests.centre_id = diagnostic_centres.id
             ORDER BY diagnostic_tests.id DESC
            `);
        
         res.json({
            tests:result.rows,
         });       
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server Error",
        });
    }
    
}

//get tests of a particular cntre
const getTestByCentre = async (req,res) => {
    
    try {

        const {centreId} =req.params;

        const result = await pool.query(`
            SELECT *
            FROM diagnostic_tests
            WHERE centre_id =$1
            ORDER BY id DESC`,
        [centreId]);

        res.json({
            tests:result.rows,
        });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server Error",
        });
        
    }
}
module.exports={
   createTest ,getTests,getTestByCentre,
}