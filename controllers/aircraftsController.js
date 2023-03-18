const Aircraft = require('../models/Aircraft')
const Airport = require('../models/Airport')
const AircraftType = require('../models/AircraftType')
const asyncHandler = require('express-async-handler')

// Document later
const listAircrafts = asyncHandler( async (req, res) => {
    const airports = await Aircraft.find().select().lean()
    if (!airports?.length) {
        return res.status(400).json({ "message": "No aircrafts found"})
    }
    res.json(airports)
})


// Document later
const createAircraft = asyncHandler( async (req, res) => {
    const { code, aircraftTypeCode, homeAirportCode } = req.body

    // Validate data
    if (!code || !aircraftTypeCode || !homeAirportCode) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check duplicate
    const duplicate = await Aircraft.findOne({ code }).lean().exec()

    if (duplicate) {
        return res.status(409).json({"message": "Duplicate code"})
    }

    // Validate aircraftType and homeAirport exists
    const aircraftType = await AircraftType.findOne({ "code": aircraftTypeCode }).lean().exec()
    if (!aircraftType) {
        return res.status(400).json({"message": `Aircraft type with code ${ aircraftTypeCode } does not exist.`})
    }

    const airport = await Airport.findOne({ "code": homeAirportCode }).lean().exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with code ${ homeAirportCode } does not exist.`})
    }

    const aircraftObject = { code, aircraftTypeCode, homeAirportCode }

    // Create and store new user
    const aircraft = await Aircraft.create(aircraftObject)

    if (aircraft) {
        res.status(200).json({ "message": `New aircraft with code ${code} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})


module.exports = {
    listAircrafts,
    createAircraft,
}