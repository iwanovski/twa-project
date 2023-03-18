const mongoose = require('mongoose')

const mechanicCrewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    memberIds: {
        type: Array,
        default: []
    },
    aircraftTypeCodes: {
        type: Array,
        default: []
    },
    homeAirportCode: {
        type: String,
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('MechanicCrew', mechanicCrewSchema)