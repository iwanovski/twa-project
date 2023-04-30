const mongoose = require('mongoose')

const aircraftSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    aircraftTypeCode: {
        type: String,
        required: true
    },
    homeAirportCode: {
        type: String,
        required: true
    },
    maintainerId: {
        type: String,
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Aicraft', aircraftSchema)