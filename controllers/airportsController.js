const Airport = require('../models/Airport')
const Flight = require('../models/Flight')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// Document later
const listAirports = asyncHandler( async (req, res) => {
    const airports = await Airport.find().select().lean()
    if (!airports?.length) {
        return res.status(400).json({ "message": "No airports found"})
    }
    res.json(airports)
})


// Document later
const createAirport = asyncHandler( async (req, res) => {
    const { fullName, code, address, managerId } = req.body

    // Validate data
    if (!fullName || !code) {
        return res.status(400).json({"message": "Fullname, code and address are required"})
    }

    // Check duplicate
    const duplicate = await Airport.findOne({ code }).lean().exec()

    if (duplicate) {
        return res.status(409).json({"message": "Duplicate airport"})
    }

    const airportObject = { fullName, code, address, managerId }

    // Create and store new user
    const airport = await Airport.create(airportObject)

    if (airport) {
        res.status(200).json({ "message": `New airport with code ${code} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

// Document later
const deleteAirport = asyncHandler( async (req, res) => {
    const { id } = req.body

    // Validate input
    if (!id) {
        return res.status(400).json({"message": `Id is required.`})
    }

    // Find airport
    const airport = await Airport.findOne({ _id: id }).exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with id ${id} does not exist.`})
    }
    
    // If exist, let's check there is no maintenance or flight scheduled for mentioned airport
    const arrivingFlights = await Flight.find({ "arrivalAirportCode": airport.code }).select().lean()
    if (arrivingFlights.length) {
        return res.status(400).json({"message": `There are scheduled flights arriving to specified airport. Delete them first.`})
    }

    // const result = await airport.deleteOne()

    res.status(200).json({"message": `Airport ${result.fullName} successfully deleted.`})
})


module.exports = {
    listAirports,
    createAirport,
    deleteAirport,
}