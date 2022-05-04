const express = require('express');
const router = express.Router();
const { Assignments, Courses } = require('../models');

const jwt = require('jsonwebtoken');
require('dotenv').config();

//getAssignments(course)
router.get('/:courseName', authenticateToken, async (req, res) => {

    /* after we've authenticated requesting client */

    //get course
    const course = await Courses.findOne({
        where: {
            name: req.params.courseName,
            UserUsername: req.user.username //provided by middleware
        }
    });

    //if course does not exist
    if(!course) return res.json({ error: "course does not exist"});
    const courseID = course.id;

    //get all assignments belong to user specific course
    const assignments = await Assignments.findAll({ where: {CourseId: courseID} }); //must wait before we execute
    res.json(assignments);
});

//createAssignment
router.post('/create', authenticateToken, async (req, res) => {

    /* after we've authenticated requesting client */

    const username = req.user.username; //provided by middleware
    const body = req.body; // { course, dueDate, weight, difficulty, priority }

    //find the course belonging to the user
    const course = await Courses.findOne(
    { 
        where: { 
            name: body.course,
            UserUsername: username
        } 
    });

    //if course exists, get id
    if(!course) return res.json({error: "course does not exist"});
    const courseID = course.id;

    //check if the assignment already exists
    const temp = await Assignments.findOne({ where: { CourseId: courseID }});
    if(temp) return res.json({error: "assignment already exists"});

    const assignment = {
        dueDate: req.body.dueDate,
        weight: req.body.weight,
        difficulty: req.body.difficulty,
        priority: req.body.priority,
        CourseId: courseID //designates a specific user
    };

    //we need a form we can submit 
    await Assignments.create(assignment);
    res.json(assignment);
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