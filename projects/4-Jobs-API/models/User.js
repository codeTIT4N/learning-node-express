const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
    },
})

// pre hook - do this before saving
UserSchema.pre('save', async function (next) {
    // hashing
    const salt = await bcrypt.genSalt(10);
    // this points to the current document/entry in db collection
    this.password = await bcrypt.hash(this.password, salt)
    // next() - in latest mongoose don't even need to do next()
})

// simple example of methods:
UserSchema.methods.getName = function () {
    return this.name;
}

UserSchema.methods.createJWT = function () {
    return jwt.sign({ userId: this._id, name: this.name }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    })
}

UserSchema.methods.comparePasswords = async function (pass) {
    const isMatch = await bcrypt.compare(pass, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema)