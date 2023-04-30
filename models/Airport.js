const mongoose = require('mongoose')

const airportSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    managerId: {
        type: String,
    },
    plannerIds: {
        type: Array,
        default: []
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Airport', airportSchema)