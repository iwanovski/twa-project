const MechanicCrew = require('../models/MechanicCrew')
const Airport = require('../models/Airport')
const asyncHandler = require('express-async-handler')

// Document later
const listMechanicCrews = asyncHandler( async (req, res) => {
    const mechanicCrews = await MechanicCrew.find().select().lean()
    if (!mechanicCrews?.length) {
        return res.status(400).json({ "message": "No mechanic crews found!"})
    }
    res.json(mechanicCrews)
})


// Document later
const createMechanicCrew = asyncHandler( async (req, res) => {
    const { name, homeAirportCode, memberIds, aircraftTypeCodes } = req.body

    // Validate data
    if (!name || !homeAirportCode) {
        return res.status(400).json({"message": "Name and home airport code are required!"})
    }

    const mechanicCrewObject = { name, homeAirportCode, aircraftTypeCodes }

    // Check every object specified exists
    const airport = await Airport.findOne({ "code": homeAirportCode }).exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with code ${homeAirportCode} does not exist.`})
    }

    // Do more complex check of members
    if (memberIds) {
        mechanicCrewObject["memberIds"] = memberIds
    }

    if (aircraftTypeCodes) {
        mechanicCrewObject.aircraftTypeCodes = aircraftTypeCodes
    }

    // Create and store new user
    const mechanicCrew = await MechanicCrew.create(mechanicCrewObject)

    if (mechanicCrew) {
        res.status(200).json({ "message": `Mechanic crew ${name} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})


module.exports = {
    listMechanicCrews,
    createMechanicCrew,
}