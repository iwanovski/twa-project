const Airport = require('../models/Airport')
const Flight = require('../models/Flight')
const Maintenance = require('../models/Maintenance')
const MechanicCrew = require('../models/MechanicCrew')
const Aircraft = require('../models/Aircraft')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

/* 
Method: Get
Desc: List all airports.
Par: <no>
*/
const listAirports = asyncHandler( async (req, res) => {
    const airports = await Airport.find().select().lean()
    if (!airports?.length) {
        return res.json([])
    }
    res.json(airports)
})


/* 
Method: POST
Desc: Create an airport.
Par:
- code: unique code of airport
- fullName: full name of airport
- address: full address of airport
- managerId: id of manager
- plannerIds: ids of existing users, that can plan flights to this airport
*/
const createAirport = asyncHandler( async (req, res) => {
    const { fullName, code, address, managerId, plannerIds } = req.body

    // Validate data
    if (!fullName || !code || !address || !managerId || !plannerIds || !plannerIds.length) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check duplicate
    const duplicate = await Airport.findOne({ code }).lean().exec()

    if (duplicate) {
        return res.status(409).json({"message": "Duplicate airport"})
    }

    const manager = await User.findOne({"_id": managerId}).lean().exec()
    if (!manager) {
        return res.status(400).json({"message": `Manager with id ${ managerId } does not exist.`})
    }
    if (!manager.roles.includes("AirportManager")) {
        return res.status(400).json({"message": `User with id ${ managerId } does not have sufficient role to be manager.`})
    }

    for (const plannerId of plannerIds) {
        let planner = await User.findOne({ "_id": plannerId }).exec()
        if (!planner) {
            return res.status(400).json({"message": `Planner with id ${plannerId} does not exist.`})
        }
        if (!planner.roles.includes("Planner")) {
            return res.status(400).json({"message": `User with id ${ plannerId } does not have sufficient role to be planner.`})
        }
    };

    const airportObject = { fullName, code, address, managerId, plannerIds }

    // Create and store new user
    const airport = await Airport.create(airportObject)

    if (airport) {
        res.status(200).json({ "message": `New airport with code ${code} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

/* 
Method: PATCH
Desc: Update an airport.
Par:
- id: id of existing airport
- fullName: full name of airport
- address: full address of airport
- managerId: id of manager
- plannerIds: ids of existing users, that can plan flights to this airport
*/
const updateAirport = asyncHandler( async (req, res) => {
    const { id, fullName, address, managerId, plannerIds, userId } = req.body

    // Validate data
    if (!id || !fullName || !address || !managerId || !plannerIds || !plannerIds.length) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check if airport exists
    const airport = await Airport.findOne({ _id: id }).exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with id ${id} does not exist.`})
    }

    const editingUser = await User.findOne({ _id: userId }).exec()
    if (!editingUser.roles.includes("Admin") && !editingUser.roles.includes("AirportsAdmin")) {
        if (!editingUser.roles.includes("AirportManager") || userId !== airport.managerId)
        return res.status(400).json({"message": `You are not allowed to edit this airport.`})
    }

    // Update simple fields
    airport.fullName = fullName || airport.fullName
    airport.address = address || airport.address

    // verify manager is a manager
    const manager = await User.findOne({"_id": managerId}).lean().exec()
    if (!manager) {
        return res.status(400).json({"message": `Manager with id ${ managerId } does not exist.`})
    }
    if (!manager.roles.includes("AirportManager")) {
        return res.status(400).json({"message": `User with id ${ managerId } does not have sufficient role to be manager.`})
    }
    airport.managerId = managerId

    // check that all planners are planners
    for (const plannerId of plannerIds) {
        let planner = await User.findOne({ "_id": plannerId }).exec()
        if (!planner) {
            return res.status(400).json({"message": `Planner with id ${plannerId} does not exist.`})
        }
        if (!planner.roles.includes("Planner")) {
            return res.status(400).json({"message": `User with id ${ plannerId } does not have sufficient role to be planner.`})
        }
    };
    airport.plannerIds = plannerIds

    const updatedAirport = await airport.save()

    res.status(200).json({ "message": `Airport with code ${updatedAirport.code} updated.`})
})

/* 
Method: DELETE
Desc: Delete an airport.
Par:
- id: id of existing airport
*/
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

    const departingFlights = await Flight.find({ "departureAirportCode": airport.code }).select().lean()
    if (departingFlights.length) {
        return res.status(400).json({"message": `There are scheduled flights departing from specified airport. Delete them first.`})
    }

    const maintenances = await Maintenance.find({ "airportCode": airport.code }).select().lean()
    if (maintenances.length) {
        return res.status(400).json({"message": `There are scheduled maintenances for specified airport. Delete them first.`})
    }

    // We need to check mechanicCrews and aircrafts as well
    const mechanicCrews = await MechanicCrew.find({ "homeAirportCode": airport.code }).select().lean()
    if (mechanicCrews.length) {
        return res.status(400).json({"message": `There are mechanic crews residing in this airport. Edit or delete them first.`})
    }

    const aircrafts = await Aircraft.find({ "homeAirportCode": airport.code }).select().lean()
    if (aircrafts.length) {
        return res.status(400).json({"message": `There are aircrafts residing in this airport. Edit or delete them first.`})
    }

    const result = await airport.deleteOne()

    res.status(200).json({"message": `Airport ${result.code} successfully deleted.`})
})


module.exports = {
    listAirports,
    createAirport,
    updateAirport,
    deleteAirport,
}