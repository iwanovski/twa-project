const Flight = require('../models/Flight')
const Aircraft = require('../models/Aircraft')
const AircraftCrew = require('../models/AircraftCrew')
const Airport = require('../models/Airport')
const asyncHandler = require('express-async-handler')

// Document later
const listFlights = asyncHandler( async (req, res) => {
    const flights = await Flight.find().select().lean()
    if (!flights?.length) {
        return res.status(400).json({ "message": "No flights scheduled."})
    }
    res.json(flights)
})


// Document later
const createFlight = asyncHandler( async (req, res) => {
    const { code, aircraftCode, aircraftCrewId, departureAirportCode, arrivalAirportCode, date } = req.body

    // Validate data
    if (!code || !aircraftCode || !aircraftCrewId || !departureAirportCode || !arrivalAirportCode || !date) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check if airport exists
    const aircraft = await Aircraft.findOne({ code: aircraftCode }).lean().exec()
    if (!aircraft) {
        return res.status(400).json({"message": `Aircraft with code ${aircraftCode} does not exist.`})
    }

    // Check if aircraftCrew exists and is ready to depart (both pilots)
    const aircraftCrew = await AircraftCrew.findOne({ _id: aircraftCrewId }).lean().exec()
    if (!aircraftCrew) {
        return res.status(400).json({"message": `Aircraft crew with id ${aircraftCrewId} does not exist.`})
    }
    console.log(aircraftCrew)
    // TODO implement check

    // Check existence of airports
    const departureAirport = await Airport.findOne({ code: departureAirportCode }).lean().exec()
    if (!departureAirport) {
        return res.status(400).json({"message": `Departure airport with code ${departureAirportCode} does not exist.`})
    }
    const arrivalAirport = await Airport.findOne({ code: arrivalAirportCode }).lean().exec()
    if (!arrivalAirport) {
        return res.status(400).json({"message": `Arrival airport with code ${arrivalAirportCode}} does not exist.`})
    }

    // TODO
    // The most complex check - validate that in that date there is no more that 2 other flights associated
    // with same aircraftCrew and aircraft.

    const flightObject = { code, aircraftCode, aircraftCrewId, departureAirportCode, arrivalAirportCode, date: new Date(date), plannedBy: "test" }

    // Create and store new user
    const flight = await Flight.create(flightObject)

    if (flight) {
        res.status(200).json({ "message": `New flight ${code} scheduled on ${date}`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})


module.exports = {
    listFlights,
    createFlight,
}