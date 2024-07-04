const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name : {
        required : true,
        type : String
    },
    age : {
        required : true,
        type : Number
    },
    mobile : {
        type : String,
    },
    email : {
        type : String,
    },
    address : {
        type: String,
        required : true
    },
    aadharCardNumber : {
        type : Number,
        required : true,
        unique: true
    },
    password : {
        required : true,
        type : String
    },
    role : {
        type : String,
        enum : ['voter', 'admin'],
        default : 'voter'
    },
    isVoted : {
        type : Boolean,
        default : false
    }
})

userSchema.pre('save', async function(next) {
    const user = this;
    if(!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(user.password, salt);
        user.password = hashedPass;
        next();
    }
    catch(err) {
        return next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch(err) {
        console.log(err);
    }
}


const user = mongoose.model('user', userSchema);
module.exports = user;