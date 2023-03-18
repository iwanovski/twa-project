const AircraftCrew = require('../models/AircraftCrew')
const asyncHandler = require('express-async-handler')

// Document later
const listAircraftCrews = asyncHandler( async (req, res) => {
    const aircraftCrews = await AircraftCrew.find().select().lean()
    if (!aircraftCrews?.length) {
        return res.status(400).json({ "message": "No aircraft crews found!"})
    }
    res.json(aircraftCrews)
})


// Document later
const createAircraftCrew = asyncHandler( async (req, res) => {
    const { name, mainPilotId, secondPilotId, memberIds } = req.body

    // Validate data
    if (!name || !mainPilotId || !secondPilotId) {
        return res.status(400).json({"message": "Name and pilot ids are required!"})
    }

    const aircraftCrewObject = { name, mainPilotId, secondPilotId }

    // Do more complex check of members
    if (memberIds) {
        aircraftCrewObject["memberIds"] = memberIds
    }

    // Create and store new user
    const aircraftCrew = await AircraftCrew.create(aircraftCrewObject)

    if (aircraftCrew) {
        res.status(200).json({ "message": `Aircraft crew ${name} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})


module.exports = {
    listAircraftCrews,
    createAircraftCrew,
}