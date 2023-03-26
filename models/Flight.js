const mongoose = require('mongoose')

const flightSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    aircraftCode: {
        type: String,
        required: true
    },
    aircraftCrewId: {
        type: String,
        required: true
    },
    departureAirportCode: {
        type: String,
        required: true
    },
    arrivalAirportCode: {
        type: String,
        required: true
    },
    plannedBy: {
        type: String,
    },
    date: {
        type: Date,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Flight', flightSchema)