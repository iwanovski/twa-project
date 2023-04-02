const Maintenance = require('../models/Maintenance')
const Aircraft = require('../models/Aircraft')
const MechanicCrew = require('../models/MechanicCrew')
const Airport = require('../models/Airport')
const asyncHandler = require('express-async-handler')

// Document later
const listMaintenances = asyncHandler( async (req, res) => {
    const maintenances = await Maintenance.find().select().lean()
    if (!maintenances?.length) {
        return res.status(400).json({ "message": "No maintenances scheduled."})
    }
    res.json(maintenances)
})


// Document later
const createMaintenance = asyncHandler( async (req, res) => {
    const { aircraftCode, airportCode, mechanicCrewId, date } = req.body

    // Validate data
    if (!aircraftCode || !airportCode || !mechanicCrewId || !date) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check if aicraft exists
    const aircraft = await Aircraft.findOne({ code: aircraftCode }).lean().exec()
    if (!aircraft) {
        return res.status(400).json({"message": `Aircraft with code ${aircraftCode} does not exist.`})
    }
    // Check existence of airport
    const airport = await Airport.findOne({ code: airportCode }).lean().exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with code ${airportCode} does not exist.`})
    }
    // Check if mechanicCrew exists and is not empty
    const mechanicCrew = await MechanicCrew.findOne({ _id: aircraftCrewId }).lean().exec()
    if (!mechanicCrew) {
        return res.status(400).json({"message": `Aircraft crew with id ${aircraftCrewId} does not exist.`})
    }
    if (!mechanicCrew.memberIds) {
        return res.status(400).json({"message": `Mechanic crew with id ${mechanicCrewId} is empty.`})
    }

    // Check if there is maintenance planned for this aircraft on this day
    
    // Check if there is more than two maintenances for this crew

    // Check if there is a flight assosiacated with aircraft


    // Create and store new maintenance
    const maintenanceObject = { aircraftCode, airportCode, mechanicCrewId, date: new Date(date), plannedBy: "test" }

    const maintenance = await Maintenance.create(maintenanceObject)

    if (maintenance) {
        res.status(200).json({ "message": `New flight ${code} scheduled on ${date}`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

// Document later
const deleteMaintenance = asyncHandler( async (req, res) => {
    const { aircraftCode, date } = req.body

    // Validate input
    if (!aircraftCode || !date) {
        return res.status(400).json({"message": `AircraftCode and date are required.`})
    }

    // Find maintenance for aircraft + date
    const maintenance = await Maintenance.findOne({ aircraftCode, date: new Date(date) }).exec()
    if (!maintenance) {
        return res.status(400).json({"message": `Maintenance or aircraft ${aircraftCode} scheduled on date ${date} not found.`})
    } 

    const result = await maintenance.deleteOne()

    res.status(200).json({"message": `Maintenance ${result.aircraftCode} on ${result.date} successfully deleted.`})
})


module.exports = {
    listMaintenances,
    createMaintenance,
    deleteMaintenance,
}