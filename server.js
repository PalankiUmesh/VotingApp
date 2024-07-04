const express = require('express')
const app = express()
require('dotenv').config();
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const db = require('./db')
const {jwtAuthMiddleware} = require('./jwt');

const userRoute = require('./Routes/userRoute')
const candidateRoute = require('./Routes/candidateRoute')
app.use('/user', userRoute)
app.use('/candidate', jwtAuthMiddleware, candidateRoute)

const PORT = process.env.PORT;
app.listen(PORT , () => {
    console.log("App is listening on port "+PORT);
})