const express = require('express');
const router = express.Router();
const { Users } = require('../models');

//bcrypt for hashing the users password before it goes into database
const bcrypt = require('bcrypt');

//jwt for generating a webtoken for authenticated users
const jwt = require('jsonwebtoken');
require('dotenv').config();

//inserting data into database
router.post('/signup', async (req, res) => {

    const { username, password } = req.body; //extract from json

    if(!username) return res.status(400).json({error: 'empty username'});
    if(!password) return res.status(400).json({error: 'empty password'});
    
    const user = await Users.findOne({ where: {username: username} });
    if(user) return res.json({error: 'username taken'});

    //hash the password 
    bcrypt.hash(password, 10).then( async (hash) => { //returns a promise so we catch the hash with a callback passed to 'then'
        const newUser = await Users.create({
            username: username,
            password: hash //generates uuid on it's own
        });
        res.json({ messgae: "succesfully signed up"});
    });

});

router.post('/login', async (req, res) => {

    //AUTHENTICATION
    const { username, password } = req.body;
    if(!username){
        res.json({error: 'empty username'});
        return;
    }
    if(!password){
        res.json({error: 'empty password'});
        return;
    }

    //can insert into try block
    const user = await Users.findOne({ where: {username: username} });
    if(!user){
        res.json({error: 'user not found'});
        return;
    }
    //compare entered password with hashed password
    //returns a promise, we handle with then, by passing a callback that takes in a match (null or not null)
    bcrypt.compare(password, user.password).then((match) => {
        if(!match){
            res.json({error: 'incorrect password'});
            return;
        }
    });

    //jwt authentication, create an access token for the user
    const plainUser = { username: user.username }; //serialized payload must be plain object 
    const accessToken = jwt.sign(plainUser, process.env.ACCESS_TOKEN_SECRET); //we want to serialize the user obj we found based on our secret key
    res.json({accessToken: accessToken}); //user information stored here

});

module.exports = router;