const mongoose = require('mongoose')

const maintenanceSchema = new mongoose.Schema({
    aircraftCode: {
        type: String,
        required: true
    },
    airportCode: {
        type: String,
        required: true
    },
    mechanicCrewId: {
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

module.exports = mongoose.model('Maintenance', maintenanceSchema)