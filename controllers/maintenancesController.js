const Maintenance = require('../models/Maintenance')
const Aircraft = require('../models/Aircraft')
const MechanicCrew = require('../models/MechanicCrew')
const Airport = require('../models/Airport')
const Flight = require('../models/Flight')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

/* 
Method: GET
Desc: List all maintenances.
Par: <no>
*/
const listMaintenances = asyncHandler( async (req, res) => {
    const maintenances = await Maintenance.find().select().lean()
    if (!maintenances?.length) {
        return res.json([])
    }
    res.json(maintenances)
})


/* 
Method: POST
Desc: Create a maintenance.
Par:
- aircraftCode: code of aircraft
- airportCode: code of airport
- mechanicCrewId: id of mechanic crew
- date: date of maintenance
- plannedBy: id of user that planned this maintenance
*/
const createMaintenance = asyncHandler( async (req, res) => {
    const { aircraftCode, airportCode, mechanicCrewId, date, plannedBy, userId } = req.body

    // Validate data
    if (!aircraftCode || !airportCode || !mechanicCrewId || !date || !plannedBy || !userId) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check if aicraft exists
    const aircraft = await Aircraft.findOne({ code: aircraftCode }).lean().exec()
    if (!aircraft) {
        return res.status(400).json({"message": `Aircraft with code ${aircraftCode} does not exist.`})
    }

    const editingUser = await User.findOne({ _id: userId }).exec()
    if (!editingUser.roles.includes("Admin") && !editingUser.roles.includes("AircraftController")) {
        if (!editingUser.roles.includes("AircraftMaintainer") || userId !== aircraft.maintainerId)
        return res.status(400).json({"message": `You are not allowed to create maintenance for this aircraft.`})
    }

    // Check existence of airport
    const airport = await Airport.findOne({ code: airportCode }).lean().exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with code ${airportCode} does not exist.`})
    }
    // Check if mechanicCrew exists
    const mechanicCrew = await MechanicCrew.findOne({ _id: mechanicCrewId }).lean().exec()
    if (!mechanicCrew) {
        return res.status(400).json({"message": `Aircraft crew with id ${mechanicCrewId} does not exist.`})
    }

    // Check if there is maintenance planned for this aircraft on this day
    const maintenancesForAircraft = await Maintenance.find({ aircraftCode, date: new Date(date)}).select().lean()
    if (maintenancesForAircraft?.length) {
        return res.status(400).json({"message": `There is maintenance planned for aircraft ${aircraftCode} on this date.`})
    }
    
    // Check if there is maintenance planned for this crew on this day
    const maintenancesForMechanicCrew = await Maintenance.find({ mechanicCrewId, date: new Date(date)}).select().lean()
    if (maintenancesForMechanicCrew?.length) {
        return res.status(400).json({"message": `There is maintenance planned for crew ${mechanicCrewId} on this date.`})
    }

    // Check if there is a flight assosiacated with aircraft on this day
    const flightsForAircraft = await Flight.find({ aircraftCode, date: new Date(date) }).select().lean()
    if (flightsForAircraft?.length) {
        return res.status(400).json({"message": `There is flight planned for aircraft ${aircraftCode} on this date.`})
    }

    // Create and store new maintenance
    const maintenanceObject = { aircraftCode, airportCode, mechanicCrewId, date: new Date(date), plannedBy }

    const maintenance = await Maintenance.create(maintenanceObject)

    if (maintenance) {
        res.status(200).json({ "message": `New maintenance for aircraft ${aircraftCode} scheduled on ${date}`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

/*
Method: PATCH
Desc: Update an maintenance.
Par:
- id: id of existing maintenance
- aircraftCode: code of aircraft
- airportCode: code of airport
- mechanicCrewId: id of mechanic crew
- date: date of maintenance
- plannedBy: id of user that planned this maintenance
*/
const updateMaintenance = asyncHandler( async (req, res) => {
    const { id, aircraftCode, airportCode, mechanicCrewId, date, plannedBy, userId } = req.body

    // Validate data
    if (!id || !aircraftCode || !airportCode || !mechanicCrewId || !date || !plannedBy || !userId) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Find maintenance
    const maintenance = await Maintenance.findOne({ _id: id }).exec()
    if (!maintenance) {
        return res.status(400).json({"message": `Maintenance with ${id} not found.`})
    }

    // Check if aicraft exists
    const aircraft = await Aircraft.findOne({ code: aircraftCode }).lean().exec()
    if (!aircraft) {
        return res.status(400).json({"message": `Aircraft with code ${aircraftCode} does not exist.`})
    }

    const editingUser = await User.findOne({ _id: userId }).exec()
    if (!editingUser.roles.includes("Admin") && !editingUser.roles.includes("AircraftController")) {
        if (!editingUser.roles.includes("AircraftMaintainer") || userId !== aircraft.maintainerId)
        return res.status(400).json({"message": `You are not allowed to edit maintenance for this aircraft.`})
    }

    // Check existence of airport
    const airport = await Airport.findOne({ code: airportCode }).lean().exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with code ${airportCode} does not exist.`})
    }
    // Check if mechanicCrew exists
    const mechanicCrew = await MechanicCrew.findOne({ _id: mechanicCrewId }).lean().exec()
    if (!mechanicCrew) {
        return res.status(400).json({"message": `Aircraft crew with id ${mechanicCrewId} does not exist.`})
    }
    maintenance.aircraftCode = aircraftCode
    maintenance.airportCode = airportCode
    maintenance.mechanicCrewId = mechanicCrewId
    maintenance.date = date

    // Check if there is maintenance planned for this aircraft on this day
    const maintenancesForAircraft = await Maintenance.find({ aircraftCode, date: new Date(date)}).select().lean()
    if (maintenancesForAircraft?.length && maintenancesForAircraft[0]._id.toString() !== id) {
        return res.status(400).json({"message": `There is maintenance planned for aircraft ${aircraftCode} on this date.`})
    }
    
    // Check if there is maintenance planned for this crew on this day
    const maintenancesForMechanicCrew = await Maintenance.find({ mechanicCrewId, date: new Date(date)}).select().lean()
    if (maintenancesForMechanicCrew?.length && maintenancesForMechanicCrew[0]._id.toString() !== id) {
        return res.status(400).json({"message": `There is maintenance planned for crew ${mechanicCrewId} on this date.`})
    }

    // Check if there is a flight assosiacated with aircraft on this day
    const flightsForAircraft = await Flight.find({ aircraftCode, date: new Date(date) }).select().lean()
    if (flightsForAircraft?.length) {
        return res.status(400).json({"message": `There is flight planned for aircraft ${aircraftCode} on this date.`})
    }
    maintenance.plannedBy = plannedBy

    const updatedMaintenance = await maintenance.save()

    res.status(200).json({ "message": `Maintenance with for aircraft ${updatedMaintenance.aircraftCode} updated on ${date}`})
})

/* 
Method: DELETE
Desc: Delete a maintenance.
Par:
- id: id of existing maintenance
*/
const deleteMaintenance = asyncHandler( async (req, res) => {
    const { id } = req.body

    // Validate input
    if (!id) {
        return res.status(400).json({"message": `Id is required.`})
    }

    // Find maintenance
    const maintenance = await Maintenance.findOne({ _id: id }).exec()
    if (!maintenance) {
        return res.status(400).json({"message": `Maintenance with ${id} not found.`})
    }

    const result = await maintenance.deleteOne()

    res.status(200).json({"message": `Maintenance on aircraft${result.aircraftCode} on ${result.date} successfully deleted.`})
})


module.exports = {
    listMaintenances,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
}