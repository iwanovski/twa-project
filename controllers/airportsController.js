const Airport = require('../models/Airport')
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


module.exports = {
    listAirports,
    createAirport,
}