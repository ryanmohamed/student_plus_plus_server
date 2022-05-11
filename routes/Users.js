const express = require('express');
const router = express.Router();
const { Users, Tokens } = require('../models');

const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/', authenticateToken, async (req, res) => {   
    //after requester has been authenticated
    const user = await Users.findOne({ where: {email: req.user.email} }); //must wait before we execute
    res.json({email: user.email}); //for now send a json with requested name, nothing else
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