const express = require('express')
const app = express()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const user = require('./Models/user')

passport.use(new LocalStrategy(async (un, pwd, done) => {
    try {
        // console.log('Recieved credentials : ', un, pwd);
        const userData = await user.findOne({username : un});
        if(!userData) return done(null, false, {message : 'Invalid username'});
        const isPasswordMatch = await userData.comparePassword(pwd);
        if(isPasswordMatch) return done(null, user);
        else return done(null, false, {message : 'Invalid password'});
    }
    catch(err) {
        return done(err);
    }
}))

module.exports = passport;