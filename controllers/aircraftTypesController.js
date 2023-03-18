const AircraftType = require('../models/AircraftType')
const asyncHandler = require('express-async-handler')

// Document later
const listAircraftTypes = asyncHandler( async (req, res) => {
    const airportTypes = await AircraftType.find().select().lean()
    if (!airportTypes?.length) {
        return res.status(400).json({ "message": "No airport types found"})
    }
    res.json(airportTypes)
})


// Document later
const createAircraftType = asyncHandler( async (req, res) => {
    const { name, code, weight, height, width, numberOfPlaces } = req.body

    // Validate data
    if (!name || !code || !weight || !height || !width || !numberOfPlaces) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check duplicate
    const duplicate = await AircraftType.findOne({ code }).lean().exec()

    if (duplicate) {
        return res.status(409).json({"message": "Duplicate code"})
    }

    const aircraftTypeObject = { name, code, weight, height, width, numberOfPlaces }

    // Create and store new user
    const user = await AircraftType.create(aircraftTypeObject)

    if (user) {
        res.status(200).json({ "message": `New aircraft type ${code} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

const updateAircraftType = asyncHandler( async (req, res) => {
    const { name, code, weight, height, width, numberOfPlaces } = req.body

    // Check if aircraft type exists
    const aircraftType = await AircraftType.findOne({ code }).exec()
    if (!aircraftType) {
        return res.status(400).json({"message": `Aircraft type with code ${code} does not exist.`})
    }

    // Update fields
    aircraftType.name = name || aircraftType.name
    aircraftType.weight = weight || aircraftType.weight
    aircraftType.height = height || aircraftType.height
    aircraftType.width = width || aircraftType.width
    aircraftType.numberOfPlaces = numberOfPlaces || aircraftType.numberOfPlaces

    const updatedAircraftType = await aircraftType.save()

    res.status(200).json({ "message": `Aircraft type with code ${updatedAircraftType.code} updated.`})
})


module.exports = {
    listAircraftTypes,
    createAircraftType,
    updateAircraftType,
}