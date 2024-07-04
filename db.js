const mongoose = require('mongoose')
require('dotenv').config()

// const mongodbURL = process.env.mongodbURL
const mongodbURL = process.env.mongodbAtlasURL

mongoose.connect(mongodbURL, {
    useNewUrlParser : true,
    useUnifiedTopology: true
})

// Get the default connection
// Mongoose maintain a default connection object representing the MongoDB connection.
const db = mongoose.connection;

// Define event listener of database
db.on('connected', () => {
    console.log("Connected to mongodb server")
});
db.on('error', (err) => {
    console.log("Error while connecting, ", err)
});
db.on('disconnected', () => {
    console.log("MongoDB disconnected");
})

// Export the db connection
module.exports = db;
