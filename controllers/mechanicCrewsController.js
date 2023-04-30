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

    // Complex check of members
    if (memberIds) {
        let members = []
        for (const memberId of memberIds) {
            let member = await User.findOne({ "code": memberId }).exec()
            if (!member) {
                return res.status(400).json({"message": `User with id ${memberId} does not exist.`})
            }
            members.push(member)
        };
        for (const member of members) {
            member.isMember += 1
            member.save()
        }
        mechanicCrewObject["memberIds"] = memberIds
    } else {
        mechanicCrewObject["memberIds"] = []
    }

    // Check that every aircraftType exists
    if (aircraftTypeCodes) {
        for (const aircraftTypeCode of aircraftTypeCodes) {
            let aircraftType = await AircraftType.findOne({ "code": aircraftTypeCode }).exec()
            if (!aircraftType) {
                return res.status(400).json({"message": `Aircraft type with code ${aircraftType} does not exist.`})
            }
        };
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
    if (memberIds) {
        let members = []
        for (const memberId of memberIds) {
            let member
            try {
                member = await User.findOne({ "_id": memberId }).exec()
            } catch (e) {
                return res.status(400).json({"message": `Ids have different format.`})
            }
            
            if (!member) {
                return res.status(400).json({"message": `User with id ${memberId} does not exist.`})
            }
            members.push(member)
        }

        for (const member of members) {
            if (!mechanicCrew.memberIds.includes(member._id)) {
                member.isMember += 1
                member.save()
            }
        }
        mechanicCrew["memberIds"] = memberIds
    } else {
        mechanicCrew["memberIds"] = []
    }

    // Update complex parameters
    if (aircraftTypeCodes) {
        for (const aircraftTypeCode of aircraftTypeCodes) {
            let aircraftType = await AircraftType.findOne({ "code": aircraftTypeCode }).exec()
            if (!aircraftType) {
                return res.status(400).json({"message": `Aircraft type with code ${aircraftType} does not exist.`})
            }
        };
        mechanicCrew.aircraftTypeCodes = aircraftTypeCodes
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

    // Delete members gracefully

    const result = await mechanicCrew.deleteOne()

    res.status(200).json({"message": `MechanicCrew with id ${result.id} successfully deleted.`})
})

module.exports = {
    createMechanicCrew,
    listMechanicCrews,
    updateMechanicCrew,
    deleteMechanicCrew,
}