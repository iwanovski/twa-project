const MechanicCrew = require('../models/MechanicCrew')
const Airport = require('../models/Airport')
const AircraftType = require('../models/AircraftType')
const User = require('../models/User')
const Maintenance = require('../models/Maintenance')
const asyncHandler = require('express-async-handler')

// Document later
const listMechanicCrews = asyncHandler( async (req, res) => {
    // Allow request body for more complex listing
    const mechanicCrews = await MechanicCrew.find().select().lean()
    if (!mechanicCrews?.length) {
        return res.status(400).json({ "message": "No mechanic crews found!"})
    }
    res.json(mechanicCrews)
})


// Document later
const createMechanicCrew = asyncHandler( async (req, res) => {
    const { name, homeAirportCode, memberIds, aircraftTypeCodes } = req.body

    // Validate data
    if (!name || !homeAirportCode) {
        return res.status(400).json({"message": "Name and home airport code are required!"})
    }

    const mechanicCrewObject = { name, homeAirportCode }

    // Check every object specified exists
    const airport = await Airport.findOne({ "code": homeAirportCode }).exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with code ${homeAirportCode} does not exist.`})
    }

    // TODO Do more complex check of members - validate member exists a is not part of other crew
    if (memberIds) {
        memberIds.forEach(async userId => {
            let user = await User.findById(userId).exec()
            if (!user) {
                return res.status(400).json({"message": `User with id ${userId} does not exist.`})
            }
            if (user.isMember) {
                return res.status(400).json({"message": `User with id ${userId} is already part of crew.`})
            }
        });

        mechanicCrewObject["memberIds"] = memberIds
    }

    // Check that every aircraftType exists
    if (aircraftTypeCodes) {
        aircraftTypeCodes.forEach(async aircraftType => {
            let aircraftType = await AircraftType.findOne({ "code": aircraftType}).exec()
            if (!aircraftType) {
                return res.status(400).json({"message": `Aircraft type with code ${aircraftType} does not exist.`})
            }
        });

        mechanicCrewObject.aircraftTypeCodes = aircraftTypeCodes
    }

    // Create and store new mechanic crew
    const mechanicCrew = await MechanicCrew.create(mechanicCrewObject)

    if (mechanicCrew) {
        res.status(200).json({ "message": `Mechanic crew ${name} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

// Document later
const updateMechanicCrew = asyncHandler( async (req, res) => {
    const { id, name, homeAirportCode, memberIds, aircraftTypeCodes } = req.body

    // Check if mechanicCrew exists
    const mechanicCrew = await MechanicCrew.findOne({ _id: id }).exec()
    if (!mechanicCrew) {
        return res.status(400).json({"message": `MechanicCrew with id ${id} does not exist.`})
    }

    // Update simple parameters
    mechanicCrew.name = name
    if (homeAirportCode) {
        const airport = await Airport.findOne({ "code": homeAirportCode }).exec()
        if (!airport) {
            return res.status(400).json({"message": `Airport with code ${homeAirportCode} does not exist.`})
        }
        mechanicCrew.homeAirportCode = homeAirportCode
    }

    // Update complex parameters
    if (aircraftTypeCodes) {
        aircraftTypeCodes.forEach(async aircraftType => {
            let aircraftType = await AircraftType.findOne({ "code": aircraftType}).exec()
            if (!aircraftType) {
                return res.status(400).json({"message": `Aircraft type with code ${aircraftType} does not exist.`})
            }
        });
        mechanicCrew.aircraftTypeCodes = aircraftTypeCodes
    }

    // TODO: Need for comparing current members as they fail in second condition
    if (memberIds) {
        memberIds.forEach(async userId => {
            let user = await User.findById(userId).exec()
            if (!user) {
                return res.status(400).json({"message": `User with id ${userId} does not exist.`})
            }
            if (user.isMember) {
                return res.status(400).json({"message": `User with id ${userId} is already part of crew.`})
            }
        });

        mechanicCrew.memberIds = memberIds
    }

    const updatedMechanicCrew = await mechanicCrew.save()

    res.status(200).json({ "message": `MechanicCrew ${updatedMechanicCrew.name} updated.`})
})

// Document later
const deleteMechanicCrew = asyncHandler( async (req, res) => {
    const { id } = req.body

    // Validate input
    if (!id) {
        return res.status(400).json({"message": `Id of mechanic crew is required.`})
    }

    // Find mechanicCrew
    const mechanicCrew = await MechanicCrew.findOne({ _id: id }).exec()
    if (!mechanicCrew) {
        return res.status(400).json({"message": `MechanicCrew with id ${id} does not exist.`})
    } 

    // Validate there is no maintenance planned for this crew
    const maintenances = await Maintenance.find({ mechanicCrewId: id}).select().lean()
    if (maintenances) {
        return res.status(400).json({"message": `MechanicCrew has ${maintenance.length} maintenances scheduled and therefore can not be deleted.`})
    } 

    const result = await mechanicCrew.deleteOne()

    res.status(200).json({"message": `MechanicCrew with id ${result.id} successfully deleted.`})
})

module.exports = {
    createMechanicCrew,
    listMechanicCrews,
    updateMechanicCrew,
    deleteMechanicCrew,
}