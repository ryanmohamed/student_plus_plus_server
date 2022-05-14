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
            UserEmail: req.user.email //provided by middleware
        }
    });

    //if course does not exist
    if(!course) return res.json({ error: "course does not exist"});
    const courseID = course.id;

    //get all assignments belong to user specific course
    const assignments = await Assignments.findAll({ where: {CourseId: courseID} }); //must wait before we execute
    res.json(assignments);
});

router.get('/', authenticateToken, async (req, res) => {

    //get course
    const courses = await Courses.findAll({
        where: {
            UserEmail: req.user.email //provided by middleware
        }
    });

    //if course does not exist
    if(!courses) return res.json({ error: "no courses exist"});

    let temp = [];

    let assignments = await Promise.all(courses.map(async (course) => {
        return await getAssignments(course);
    }));

    const payload = assignments.filter(assignment => {
        return assignment !== undefined;
    });

    return res.json(payload);
});

const getAssignments = async (course) => {
    const assignments = await Assignments.findAll({
        where: { CourseId: course.id},
        raw: true
    });

    if(!assignments) return;

    if(assignments.length > 0 && assignments != undefined) {
        return assignments;
    }
}

//createAssignment
router.post('/create', authenticateToken, async (req, res) => {

    /* after we've authenticated requesting client */

    const email = req.user.email; //provided by middleware
    const body = req.body; // { course, dueDate, weight, difficulty, priority }

    //find the course belonging to the user
    const course = await Courses.findOne(
    { 
        where: { 
            name: body.course,
            UserEmail: email
        } 
    });

    //if course exists, get id
    if(!course) return res.json({error: "course does not exist"});
    const courseID = course.id;

    //check if the assignment already exists

    //console.log(courseID, req.body.id);

    //ONLY ALLOWS ONE ASSIGNMENT PER CLASS, revise

    await Assignments.findOrCreate({
        where: {
            id: req.body.id,
            dueDate: req.body.dueDate,
            weight: req.body.weight,
            difficulty: req.body.difficulty,
            CourseId: courseID //designates a specific user
        }
    }).then(([assignment, created]) => {
        if(created) return res.json(assignment);
        else return res.json({error: 'assignments already exists'});
    });

    //if(!created) return res.json({error: "assignment already exists"});
    //if(!row) return res.json({error: "unable to create"});
    
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