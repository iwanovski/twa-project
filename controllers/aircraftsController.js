const Aircraft = require('../models/Aircraft')
const Airport = require('../models/Airport')
const AircraftType = require('../models/AircraftType')
const Flight = require('../models/Flight')
const Maintenance = require('../models/Maintenance')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

/* 
Method: Get
Desc: List all aircrafts.
Par: <no>
*/
const listAircrafts = asyncHandler( async (req, res) => {
    const airports = await Aircraft.find().select().lean()
    if (!airports?.length) {
        return res.json([])
    }
    res.json(airports)
})


/* 
Method: POST
Desc: Create an aircraft.
Par:
- code: unique code of aircraft
- aircraftTypeCode: code of affiliated aircraftType
- homeAirportCode: home airport of this aircraft
- maintainerId: id of maintainer
*/
const createAircraft = asyncHandler( async (req, res) => {
    const { code, aircraftTypeCode, homeAirportCode, maintainerId } = req.body

    // Validate data
    if (!code || !aircraftTypeCode || !homeAirportCode || !maintainerId) {
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

    // Validate that maintainer exists and is maintainer
    const maintainer = await User.findOne({ "_id": maintainerId }).lean().exec()
    if (!maintainer) {
        return res.status(400).json({"message": `User with id ${ maintainerId } does not exist.`})
    }
    if (!maintainer.roles.includes("AircraftMaintainer")) {
        return res.status(400).json({"message": `User with id ${ maintainerId } does not have sufficient role to be maintainer.`})
    }

    const aircraftObject = { code, aircraftTypeCode, homeAirportCode, maintainerId }

    // Create and store new user
    const aircraft = await Aircraft.create(aircraftObject)

    if (aircraft) {
        res.status(200).json({ "message": `New aircraft with code ${code} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

/* 
Method: PATCH
Desc: Update an aircraft.
Par:
- id: id of existing aircraft
- aircraftTypeCode: code of affiliated aircraftType
- homeAirportCode: home airport of this aircraft
- maintainerId: id of maintainer
- userId: id of user that is trying to edit
*/
const updateAircraft = asyncHandler( async (req, res) => {
    const { id, aircraftTypeCode, homeAirportCode, maintainerId, userId } = req.body

    // Validate data
    if (!id || !aircraftTypeCode || !homeAirportCode || !maintainerId || !userId) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check if aircraft exists
    const aircraft = await Aircraft.findOne({ _id: id }).exec()
    if (!aircraft) {
        return res.status(400).json({"message": `Aircraft with id ${id} does not exist.`})
    }

    const editingUser = await User.findOne({ _id: userId }).exec()
    if (!editingUser.roles.includes("Admin") && !editingUser.roles.includes("AircraftController")) {
        if (!editingUser.roles.includes("AircraftMaintainer") || userId !== aircraft.maintainerId)
        return res.status(400).json({"message": `You are not allowed to edit this aircraft.`})
    }

    // Update fields
    const aircraftType = await AircraftType.findOne({ "code": aircraftTypeCode }).lean().exec()
    if (!aircraftType) {
        return res.status(400).json({"message": `Aircraft type with code ${ aircraftTypeCode } does not exist.`})
    }
    aircraft.aircraftTypeCode = aircraftTypeCode

    const airport = await Airport.findOne({ "code": homeAirportCode }).lean().exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with code ${ homeAirportCode } does not exist.`})
    }
    aircraft.homeAirportCode = homeAirportCode

    // Validate that maintainer exists and is maintainer
    const maintainer = await User.findOne({ "_id": maintainerId }).lean().exec()
    if (!maintainer) {
        return res.status(400).json({"message": `User with id ${ maintainerId } does not exist.`})
    }
    if (!maintainer.roles.includes("AircraftMaintainer")) {
        return res.status(400).json({"message": `User with id ${ maintainerId } does not have sufficient role to be maintainer.`})
    }
    aircraft.maintainerId = maintainerId

    const updatedAircraft = await aircraft.save()

    res.status(200).json({ "message": `Aircraft with code ${updatedAircraft.code} updated.`})
})

/* 
Method: DELETE
Desc: Delete an aircraft.
Par:
- id: id of existing aircraft
*/
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
    updateAircraft,
    deleteAircraft,
}