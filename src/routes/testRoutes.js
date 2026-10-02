const express = require('express');

const {createTest,getTests,getTestByCentre}=require('../controllers/testController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();


//add a tests
router.post("/",authMiddleware,createTest);

//get all tests
router.get("/",getTests);

//get tests of a particular centre
router.get("/centre/:centreId",getTestByCentre);

module.exports=router;