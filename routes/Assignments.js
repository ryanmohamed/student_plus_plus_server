const express = require('express');
const router = express.Router();
const { Assignments, Courses, Categories } = require('../models');

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

//getPriorityList
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
        const assignments = await Assignments.findAll({
            where: { CourseId: course.id},
            order : [
                ['priority', 'DESC']
            ],
            raw: true
        })
        if(assignments.length === 0) return;
        await assignments.map(assignment => {
            temp.push(assignment);
            return;
        });
    }));
    return res.json(temp);
});

function diff(dueDate){
    let dueMM = parseInt(dueDate.substring(5, 7));
    let dueDD = parseInt(dueDate.substring(8));
    let todayMM = new Date().getMonth() + 1;
    let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let todayDD = new Date().getDate();

    if(todayMM > dueMM) return null;
    return ((dueMM - todayMM) * days[todayMM-1]) + (dueDD - todayDD);

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

    const categoryName = (!req.body.courseCategory) ? null : req.body.courseCategory;
    let priority = null;

    if(categoryName){
        const category = await Categories.findOne({
            where: {
                name: req.body.courseCategory,
                CourseId: courseID
            }
        });
        if(!category) return res.json({error: "category doesn't exist in course"});
    
        const time = diff(req.body.dueDate);
        const diffTimeRatio = req.body.difficulty / (time+1);
        priority = diffTimeRatio * category.weight;
    }
    
    await Assignments.findOrCreate({
        where: {
            courseName: body.course,
            name: req.body.name,
            dueDate: req.body.dueDate,
            perfectScore: req.body.perfectScore,
            difficulty: req.body.difficulty,
            courseCategory: categoryName,
            CourseId: courseID //designates a specific user
        }
    }).then( async ([assignment, created]) => {
        if(created) {
            assignment.priority = priority;
            await assignment.save();
            return res.json(assignment);
        }
        else return res.json({error: 'assignments already exists'});
    });

});

//updateAssignment(courseName, name)
router.post('/:courseName/:name', authenticateToken, async (req, res) => {

    //find the course belonging to the user
    const course = await Courses.findOne(
    { 
        where: { 
            name: req.params.courseName,
            UserEmail: req.user.email
        } 
    });

    //if course exists, get id
    if(!course) return res.json({error: "course does not exist"});
    const courseID = course.id;

    const assignment = await Assignments.findOne({
        where: {
            name: req.params.name,
            CourseId: courseID
        }
    });
    if(!assignment) return res.json({error: "assignment does not exist"});
    
    assignment.completion = true;
    assignment.scoreRecieved = req.body.scoreRecieved;
    assignment.estimatedCompletionTime = req.body.estimatedCompletionTime;
    assignment.priority = 0;
    await assignment.save();

    return res.json(assignment);
    
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