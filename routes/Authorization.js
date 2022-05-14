const express = require('express');
const router = express.Router();
const { Users, Tokens } = require('../models');

//bcrypt for hashing the users password before it goes into database
const bcrypt = require('bcrypt');

//jwt for generating a webtoken for authenticated users
const jwt = require('jsonwebtoken');
require('dotenv').config();

//inserting data into database
router.post('/signup', async (req, res) => {

    const { email, password } = req.body; //extract from json

    if(!email) return res.status(400).json({error: 'empty email'});
    if(!password) return res.status(400).json({error: 'empty password'});
    
    const user = await Users.findOne({ where: {email: email} });
    if(user) return res.json({error: 'email taken'});

    //hash the password 
    bcrypt.hash(password, 10).then( async (hash) => { //returns a promise so we catch the hash with a callback passed to 'then'
        const newUser = await Users.create({
            email: email,
            password: hash //generates uuid on it's own
        });
        res.json({ message: "succesfully signed up"});
    });

});

router.post('/login', async (req, res) => {

    //AUTHENTICATION
    const { email, password } = req.body;
    if(!email){
        return res.json({error: 'empty email'});
    }
    if(!password){
        return res.json({error: 'empty password'});
    }

    //can insert into try block
    const user = await Users.findOne({ where: {email: email} });
    if(!user){
        return res.json({error: 'user not found'});
    }
    //compare entered password with hashed password
    //returns a promise, we handle with then, by passing a callback that takes in a match (null or not null)
    await bcrypt.compare(password, user.password).then( async (match) => {
        if(!match){
            console.log(match);
            return res.json({error: 'incorrect password'});
        }

        else {

            //jwt authentication, create an access token for the user
            const plainUser = { email: user.email }; //serialized payload must be plain object 
    
            //this alone, gives the user infinite access, we want to mend this with a refresh token
            const accessToken = generateAccessToken(plainUser); //we want to serialize the user obj we found based on our secret key
            const refreshToken = generateRefreshToken(plainUser);

            //add a refresh token (used to persist user access to expiring access tokens)
            await Tokens.create({ refreshToken: refreshToken, UserEmail: user.email });
    
            return res.cookie('refreshToken', refreshToken).json({ accessToken: accessToken});

        }
    });

    
    
});

//for creating a new access token
router.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if(!refreshToken) return res.sendStatus(401);
    const temp = Tokens.findOne({where: {refreshToken: refreshToken}});
    if(!temp) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ email: user.email });
        res.json({accessToken: accessToken});
    });
});

//to remove these refresh tokens
router.delete('/logout', async (req, res) => {
    const token = await Tokens.findOne({ where: {refreshToken: req.body.token} });
    if(!token) return res.json({ error: "refresh token doesn't exist"});
    await token.destroy();
    return res.json({ message: "succesfully logged out"});
});

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '10m'
    });
}

function generateRefreshToken(user){
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    });
}

module.exports = router;