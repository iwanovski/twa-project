const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    roles: {
        type: Array,
        default: []
    },
    isMember: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('User', userSchema)