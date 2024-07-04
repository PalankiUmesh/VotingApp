const express = require('express');
const app = express();
const route = express.Router();
const candidate = require('../Models/candidate')
const user = require('../Models/user');
const { jwtAuthMiddleware } = require('../jwt');

const checkAdminRole = async (userId) => {
    try {
        const userData = await user.findById(userId);
        return userData.role == 'admin'
    }
    catch(err) {
        return false;
    }
}

route.post('/', async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)) return res.status(403).json({message: 'User does not have admin role'})
        const data = req.body;
        const newCandidate = new candidate(data);
        const response = await newCandidate.save();
        console.log('Candidate data saved');
        res.status(200).json({response : response})
    }
    catch(err) {
        console.log(err);
        res.status(500).json({Error : 'Internal server error'})
    }
})


// PUT method to update candidate data
route.put('/:candidateId', async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)) return res.status(403).json({message: 'User does not have admin role'})
        const candidateId = req.params.candidateId; // Extract the id from the URL parameters
        const candidatedata = req.body; // Updated data from the person
        const response = await candidate.findByIdAndUpdate(candidateId, candidatedata, {
            new : true, // Return the updated document
            runValidators : true // Run mongoose validation
        })
        if(!response) {
            res.status(404).json({error : 'Candidate id invalid'})
        }
        console.log('Candidate data updated');
        res.status(200).json(response)
    }
    catch(err) {
        console.log(err);
        res.status(500).json({Error : 'Internal server error'})
    }
})

route.delete('/:candidateId', async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)) return res.status(403).json({message: 'User does not have admin role'})
        const candidateId = req.params.candidateId; // Extract the id from the URL parameters
        const response = await candidate.findByIdAndDelete(candidateId)
        if(!response) {
            res.status(404).json({error : 'Candidate id invalid'})
        }
        console.log('Candidate deleted');
        res.status(200).json(response)
    }
    catch(err) {
        console.log(err);
        res.status(500).json({Error : 'Internal server error'})
    }
})

// POST method to vote
route.post('/vote/:cadidateId', jwtAuthMiddleware, async (req, res) => {  
    // Admin cant vote only voter can vote
    try {
        const userId = req.user.id;
        const candidateId = req.params.cadidateId;
        const candidateData = await candidate.findById(candidateId)
        if(!candidateData) 
            res.status(404).json({message : 'Candidate not found'})
        const userData = await user.findById(userId)
        if(!userData) 
            res.status(404).json({message : 'User not found'})
        if(userData.isVoted)
            res.status(400).json({message : 'You have already voted'})
        if(userData.role === 'admin')
            res.status(403).json({message : 'Admin cannot vote'})
        
        // Update the candidate document to record vote
        candidateData.votes.push({user : userId});
        candidateData.voteCount++;
        await candidateData.save();

        // Update the user document
        userData.isVoted = true;
        await userData.save();

        res.status(200).json({message : 'Vote recorded successfully'})
    }
    catch(err) {
        console.log(err)
        res.status(500).json({Error : 'Internal server error'})
    }
})

// Get method to get the count of votes of a candidate
route.get('/count/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const candidateID = req.params.candidateId;
        const candidateData = await candidate.findById(candidateID)
        const userData = await user.findById(userId)
        if(!candidateData) 
            res.status(404).json({message : 'Candidate not found'})
        if(!(userData.role === 'admin') || !userData) 
            res.status(403).json({message : 'You cant access'})
        const count = candidateData.voteCount;
        res.status(200).json({message : 'candidate votes', count : count})
    }
    catch(err) {
        console.log(err)
        res.status(500).json({Error : 'Internal server error'})
    }
})

// GET method to get all the candiates count
route.get('/count', jwtAuthMiddleware, async (req, res) => {
    try {
        // Get all the candidate from DB
        const candidates = await candidate.find().sort({voteCount : 'desc'});

        // Map only the candidates to only return count
        const voteRecord = candidates.map((data) => {
            return {
                party : data.party,
                count : data.voteCount
            }
        });
        return res.status(200).json(voteRecord);
    }
    catch(err) {
        console.log(err)
        res.status(500).json({Error : 'Internal server error'})
    }
})

module.exports = route;