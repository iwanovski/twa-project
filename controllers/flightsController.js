const Flight = require('../models/Flight')
const Aircraft = require('../models/Aircraft')
const AircraftCrew = require('../models/AircraftCrew')
const Airport = require('../models/Airport')
const User = require('../models/User')
const Maintenance = require('../models/Maintenance')
const asyncHandler = require('express-async-handler')

/* 
Method: GET
Desc: List all flights.
Par: <no>
*/
const listFlights = asyncHandler( async (req, res) => {
    const flights = await Flight.find().select().lean()
    if (!flights?.length) {
        return res.json([])
    }
    res.json(flights)
})


/* 
Method: POST
Desc: Create a flight.
Par:
- code: unique code of flight
- aircraftCode: code of aircraft
- aircraftCrewId: id of aircraftCrew
- departureAirportCode: code of departing airport
- arrivalAirportCode: code of arriving airport
- date: date of flight
- plannedBy: id of user that planned this flight
*/
const createFlight = asyncHandler( async (req, res) => {
    const { code, aircraftCode, aircraftCrewId, departureAirportCode, arrivalAirportCode, date, plannedBy } = req.body

    // Validate data
    if (!code || !aircraftCode || !aircraftCrewId || !departureAirportCode || !arrivalAirportCode || !date || !plannedBy) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check if aircraft exists
    const aircraft = await Aircraft.findOne({ code: aircraftCode }).lean().exec()
    if (!aircraft) {
        return res.status(400).json({"message": `Aircraft with code ${aircraftCode} does not exist.`})
    }

    // Check if aircraftCrew exists
    const aircraftCrew = await AircraftCrew.findOne({ _id: aircraftCrewId }).lean().exec()
    if (!aircraftCrew) {
        return res.status(400).json({"message": `Aircraft crew with id ${aircraftCrewId} does not exist.`})
    }

    // Check existence of airports
    const departureAirport = await Airport.findOne({ code: departureAirportCode }).lean().exec()
    if (!departureAirport) {
        return res.status(400).json({"message": `Departure airport with code ${departureAirportCode} does not exist.`})
    }
    const arrivalAirport = await Airport.findOne({ code: arrivalAirportCode }).lean().exec()
    if (!arrivalAirport) {
        return res.status(400).json({"message": `Arrival airport with code ${arrivalAirportCode}} does not exist.`})
    }
    if (arrivalAirportCode === departureAirportCode) {
        return res.status(400).json({"message": `Airports must be different.`})
    }

    const flightsWithCrew = await Flight.find({ aircraftCrewId: aircraftCrewId, date: new Date(date)}).select().lean()
    if (flightsWithCrew?.length) {
        return res.status(400).json({"message": `Crew ${aircraftCrewId} is already flying on this date.`})
    }

    const flightsWithAircraft = await Flight.find({ aircraftCode: aircraftCode, date: new Date(date)}).select().lean()
    if (flightsWithAircraft?.length) {
        return res.status(400).json({"message": `Aircraft ${aircraftCode} is already flying on this date.`})
    }

    const maintenancesWithAircraft = await Maintenance.find({ aircraftCode: aircraftCode, date: new Date(date)}).select().lean()
    if (maintenancesWithAircraft?.length) {
        return res.status(400).json({"message": `Aircraft ${aircraftCode} has maintenance planned on that day.`})
    }

    // Check that plannerBy user exist and is a Planner or Admin
    const planner = await User.findOne({ _id: plannedBy}).lean().exec()
    if (!planner) {
        return res.status(400).json({"message": `Planner with id ${plannedBy} does not exist.`})
    }
    if (!planner.roles.includes("Planner") && !planner.roles.includes('Admin')) {
        return res.status(400).json({"message": `User with id ${plannedBy} must be planner.`})
    }

    // Check that plannerBy is in plannerIds of both airports if not admin
    if (planner.roles.includes("Planner")) {
        if (!departureAirport.plannerIds.includes(plannedBy) || !arrivalAirport.plannerIds.includes(plannedBy)) {
            return res.status(400).json({"message": `Planner with id ${plannedBy} needs to have permission to create flights to both airports.`})
        }
    }

    const flightObject = { code, aircraftCode, aircraftCrewId, departureAirportCode, arrivalAirportCode, date: new Date(date), plannedBy }

    // Create and store new user
    const flight = await Flight.create(flightObject)

    if (flight) {
        res.status(200).json({ "message": `New flight ${code} scheduled on ${date}`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

/* 
Method: PATCH
Desc: Update a flight.
Par:
- id: id of existing flight
- aircraftCode: code of aircraft
- aircraftCrewId: id of aircraftCrew
- departureAirportCode: code of departing airport
- arrivalAirportCode: code of arriving airport
- date: date of flight
- plannedBy: id of user that planned this flight
*/
const updateFlight = asyncHandler( async (req, res) => {
    const { id, aircraftCode, aircraftCrewId, departureAirportCode, arrivalAirportCode, date, plannedBy } = req.body

    // Validate data
    if (!id || !aircraftCode || !aircraftCrewId || !departureAirportCode || !arrivalAirportCode || !date || !plannedBy) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Find flight
    const flight = await Flight.findOne({ _id: id }).exec()
    if (!flight) {
        return res.status(400).json({"message": `Flight with id ${id} not found.`})
    } 

    // Check if aircraft exists
    const aircraft = await Aircraft.findOne({ code: aircraftCode }).lean().exec()
    if (!aircraft) {
        return res.status(400).json({"message": `Aircraft with code ${aircraftCode} does not exist.`})
    }
    flight.aircraftCode = aircraftCode

    // Check if aircraftCrew exists
    const aircraftCrew = await AircraftCrew.findOne({ _id: aircraftCrewId }).lean().exec()
    if (!aircraftCrew) {
        return res.status(400).json({"message": `Aircraft crew with id ${aircraftCrewId} does not exist.`})
    }
    flight.aircraftCrewId = aircraftCrewId

    // Check existence of airports
    const departureAirport = await Airport.findOne({ code: departureAirportCode }).lean().exec()
    if (!departureAirport) {
        return res.status(400).json({"message": `Departure airport with code ${departureAirportCode} does not exist.`})
    }
    const arrivalAirport = await Airport.findOne({ code: arrivalAirportCode }).lean().exec()
    if (!arrivalAirport) {
        return res.status(400).json({"message": `Arrival airport with code ${arrivalAirportCode}} does not exist.`})
    }
    if (arrivalAirportCode === departureAirportCode) {
        return res.status(400).json({"message": `Airports must be different.`})
    }
    flight.arrivalAirportCode = arrivalAirportCode
    flight.departureAirportCode = departureAirportCode
    flight.date = date

    const flightsWithCrew = await Flight.find({ aircraftCrewId: aircraftCrewId, date: new Date(date)}).select().lean()
    if (flightsWithCrew?.length && flightsWithCrew[0]._id.toString() !== id) {
        return res.status(400).json({"message": `Crew ${aircraftCrewId} is already flying on this date.`})
    }

    const flightsWithAircraft = await Flight.find({ aircraftCode: aircraftCode, date: new Date(date)}).select().lean()
    if (flightsWithAircraft?.length && flightsWithAircraft[0]._id.toString() !== id) {
        return res.status(400).json({"message": `Aircraft ${aircraftCode} is already flying on this date.`})
    }

    const maintenancesWithAircraft = await Maintenance.find({ aircraftCode: aircraftCode, date: new Date(date)}).select().lean()
    if (maintenancesWithAircraft?.length) {
        return res.status(400).json({"message": `Aircraft ${aircraftCode} has maintenance planned on that day.`})
    }

    // Check that plannerBy user exist and is a Planner or Admin
    const planner = await User.findOne({ _id: plannedBy}).lean().exec()
    if (!planner) {
        return res.status(400).json({"message": `Planner with id ${plannedBy} does not exist.`})
    }
    if (!planner.roles.includes("Planner") && !planner.roles.includes('Admin')) {
        return res.status(400).json({"message": `User with id ${plannedBy} must be planner.`})
    }
    flight.plannedBy = plannedBy

    // Check that plannerBy is in plannerIds of both airports if not admin
    if (planner.roles.includes("Planner")) {
        if (!departureAirport.plannerIds.includes(plannedBy) || !arrivalAirport.plannerIds.includes(plannedBy)) {
            return res.status(400).json({"message": `Planner with id ${plannedBy} needs to have permission to create flights to both airports.`})
        }
    }

    const updatedFlight = await flight.save()

    res.status(200).json({ "message": `Flight with code ${updatedFlight.code} flying on date ${updatedFlight.date} updated.`})
})

/* 
Method: DELETE
Desc: Delete a flight.
Par:
- id: id of existing flight
*/
const deleteFlight = asyncHandler( async (req, res) => {
    const { id } = req.body

    // Validate input
    if (!id) {
        return res.status(400).json({"message": `Id is required.`})
    }

    // Find flight
    const flight = await Flight.findOne({ _id: id }).exec()
    if (!flight) {
        return res.status(400).json({"message": `Flight with code ${code} scheduled on date ${date} not found.`})
    } 

    const result = await flight.deleteOne()

    res.status(200).json({"message": `Flight ${result.code} on ${result.date} successfully deleted.`})
})


module.exports = {
    listFlights,
    createFlight,
    updateFlight,
    deleteFlight,
}