const Aircraft = require('../models/Aircraft')
const Airport = require('../models/Airport')
const AircraftType = require('../models/AircraftType')
const Flight = require('../models/Flight')
const Maintenance = require('../models/Maintenance')
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

const updateAircraft = asyncHandler( async (req, res) => {
    const { id, aircraftTypeCode, homeAirportCode } = req.body

    // Check if aircraft type exists
    const aircraft = await Aircraft.findOne({ _id: id }).exec()
    if (!aircraft) {
        return res.status(400).json({"message": `Aircraft with id ${id} does not exist.`})
    }

    // Update fields
    if (aircraftTypeCode) {
        const aircraftType = await AircraftType.findOne({ "code": aircraftTypeCode }).lean().exec()
        if (!aircraftType) {
            return res.status(400).json({"message": `Aircraft type with code ${ aircraftTypeCode } does not exist.`})
        }
        aircraft.aircraftTypeCode = aircraftTypeCode
    }

    if (homeAirportCode) {
        const airport = await Airport.findOne({ "code": homeAirportCode }).lean().exec()
        if (!airport) {
            return res.status(400).json({"message": `Airport with code ${ homeAirportCode } does not exist.`})
        }
        aircraft.homeAirportCode = homeAirportCode
    }

    const updatedAircraft = await aircraft.save()

    res.status(200).json({ "message": `Aircraft with code ${updatedAircraft.code} updated.`})
})

const deleteAircraft = asyncHandler( async (req, res) => {
    const { id } = req.body

    // Validate input
    if (!id) {
        return res.status(400).json({"message": `Id is required.`})
    }

    // Find aircraft
    const aircraft = await Aircraft.findOne({ _id: id }).exec()
    if (!aircraft) {
        return res.status(400).json({"message": `Aircraft with id ${id} does not exist.`})
    }

    // Check flights and maintenances
    const flights = await Flight.find({"aircraftCode": aircraft.code}).select().lean()
    if (flights.length) {
        return res.status(400).json({"message": `There are still flights scheduled for specific aircraft. Edit or delete them first`})
    }

    const maintenances = await Maintenance.find({"aircraftCode": aircraft.code}).select().lean()
    if (maintenances.length) {
        return res.status(400).json({"message": `There are still maintenances scheduled for specific aircraft. Edit or delete them first`})
    }

    // Otherwise proceed with deletion
    const result = await aircraft.deleteOne()

    res.status(200).json({"message": `Aircraft with code ${result.code} successfully deleted.`})
})

module.exports = {
    listAircrafts,
    createAircraft,
    deleteAircraft,
}