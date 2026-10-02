const express = require('express');

const {createCentre,getCentres}=require('../controllers/centreController');

const authMiddleware =require('../middlewares/authMiddleware');


const router = express.Router();

router.post("/",authMiddleware,createCentre);

router.get("/",getCentres);


module.exports=router;