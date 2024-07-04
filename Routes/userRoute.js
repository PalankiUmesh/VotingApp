const express = require('express');
const app = express();
const route = express.Router();
const user = require('../Models/user')
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

route.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const newUser = new user(data);
        if(newUser.role === 'admin') {
            const userRole = await user.findOne({role : 'admin'});
            if(userRole) return res.status(401).json({Error : 'Admin already exist'})
        }
        const response = await newUser.save();
        console.log('Data saved');
        const payload = {
            id : response.id
        }
        const token = generateToken(payload)
        res.status(200).json({response : response, Token : token});
    }
    catch(err) {
        console.log(err);
        res.status(500).json({Error : 'Internal server error'})
    }
})

route.post('/login', async (req, res) => {
    try {
        const {aadharCardNumber, password} = req.body;
        const userData = await user.findOne({aadharCardNumber : aadharCardNumber})
        if(!userData || !(await userData.comparePassword(password))) {
            return res.status(401).json({Error : 'Invalid aadharCardNumber or password'})
        }
        const payload = {
            id : userData.id
        }
        const token = generateToken(payload)
        res.json({user : userData, token : token})
    }
    catch(err) {
        console.log(err);
        res.status(500).json({Error : 'Internal server error'})
    }
})

// Profile route
route.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const response = req.user;
        const userId = response.id;
        const userData = await user.findById(userId)
        res.status(200).json(userData)
    }
    catch(err) {
        console.log(err);
        res.status(500).json({Error: "Internal Server Errror"})
    }
})

// PUT method to update user data
route.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user; // extract id from token
        const {currentPassword, newPassword} = req.body; // Extract current password from request body
        const userData = await user.findById(userId)
        if(!(await userData.comparePassword(currentPassword))) return res.status(401).json({Error : 'Wrong password'})
        userData.password = newPassword;
        await userData.save();
        console.log('Password updated');
        res.status(200).json({message : "Password updated"})
    }
    catch(err) {
        console.log(err);
        res.status(500).json({Error : 'Internal server error'})
    }
})



module.exports = route;