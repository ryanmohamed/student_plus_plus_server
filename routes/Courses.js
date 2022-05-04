const express = require('express');
const router = express.Router();
const { Courses } = require('../models');

const jwt = require('jsonwebtoken');
require('dotenv').config();

//getCourses
router.get('/', authenticateToken, async (req, res) => {
    
    /* after we've authenticated requesting client */
    const username = req.user.username; //get username from middleware
    const courses = await Courses.findAll({ where: {UserUsername: username} }); //must wait before we execute
    res.json(courses);
    
});

//createCourse
router.post('/create', authenticateToken, async (req, res) => {
    
    /* after we've authenticated requesting client */
 
    // submitted as json : { name } 
    let body = req.body;
    const username = req.user.username;
    console.log(username);
    
    //check if there's the same course for the same user
    const temp = await Courses.findOne({ where: {
        name: body.name, 
        UserUsername: username //provided by middleware
    } });

    if(temp) return res.json({error: "course already exists"});

    //create valid course json
    const course = {
        name: body.name,
        gpa: null,
        /* id: generated by sequelize */
        UserUsername: username
    };
    
    await Courses.create(course); //ideally we should catch this 
    res.json(course);
});

//middleware, "lock" between client accessing any route
function authenticateToken(req, res, next){
    //access token in header
    const authHeader = req.headers['authorization']; //Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1]; //get token portion, either undefined or token portion using &&
    if(!token) return res.sendStatus(401); //null token

    //verify token using secret we hashed it with
    //callback should take in an error and the user we serialized
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403); //token no longer valid - no access
        req.user = user;
        next(); //move on from middleware
    });
}

module.exports = router;