const mongoose = require('mongoose')

const aircraftCrewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mainPilotId: {
        type: String,
        required: true
    },
    secondPilotId: {
        type: String,
        required: true
    },
    memberIds: {
        type: Array,
        default: []
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('AicraftCrew', aircraftCrewSchema)