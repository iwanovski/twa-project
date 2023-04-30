const AircraftCrew = require('../models/AircraftCrew')
const User = require('../models/User')
const Flight = require('../models/Flight')
const asyncHandler = require('express-async-handler')

// Document later
const listAircraftCrews = asyncHandler( async (req, res) => {
    const aircraftCrews = await AircraftCrew.find().select().lean()
    if (!aircraftCrews?.length) {
        return res.status(400).json({ "message": "No aircraft crews found!"})
    }
    res.json(aircraftCrews)
})


// Document later
const createAircraftCrew = asyncHandler( async (req, res) => {
    const { name, mainPilotId, secondPilotId, memberIds } = req.body

    // Validate data
    if (!name || !mainPilotId || !secondPilotId) {
        return res.status(400).json({"message": "Name and pilot ids are required!"})
    }

    const aircraftCrewObject = { name, mainPilotId, secondPilotId }

    // TODO check pilots are pilots
    const mainPilot = await User.findOne({ _id: mainPilotId }).exec()
    if (!mainPilot) {
        return res.status(400).json({"message": `Main pilot with id ${mainPilotId} does not exist.`})
    }

    const secondPilot = await User.findOne({ _id: secondPilotId }).exec()
    if (!secondPilot) {
        return res.status(400).json({"message": `Second pilot with id ${secondPilotId} does not exist.`})
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
        aircraftCrewObject["memberIds"] = memberIds
    } else {
        aircraftCrewObject["memberIds"] = []
    }

    // Create and store new user
    const aircraftCrew = await AircraftCrew.create(aircraftCrewObject)

    if (aircraftCrew) {
        res.status(200).json({ "message": `Aircraft crew ${name} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

// Document later
const updateAircraftCrew = asyncHandler( async (req, res) => {
    const { id, name, mainPilotId, secondPilotId, memberIds } = req.body
    // Check if aircraftCrew exists
    const aircraftCrew = await AircraftCrew.findOne({ _id: id }).exec()
    if (!aircraftCrew) {
        return res.status(400).json({"message": `AircraftCrew with id ${id} does not exist.`})
    }

    // Update fields and TODO validate pilots
    aircraftCrew.name = name || aircraftCrew.name
    aircraftCrew.mainPilotId = mainPilotId || aircraftCrew.mainPilotId
    aircraftCrew.secondPilotId = secondPilotId || aircraftCrew.secondPilotId

    // Update members gracefully
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
            if (!aircraftCrew.memberIds.includes(member._id)) {
                member.isMember += 1
                member.save()
            }
        }

        membersToDowngrade = []
        for (const formerMemberId of aircraftCrew.memberIds) {
            if (!memberIds.includes(formerMemberId)) {
                let member
                try {
                    member = await User.findOne({ "_id": formerMemberId }).exec()
                } catch (e) {
                    return res.status(400).json({"message": `Ids have different format.`})
                }
                if (member) {
                    membersToDowngrade.push(member)
                }
            }
        }
        for (const member of membersToDowngrade) {
            if (!(aircraftCrew.memberIds.includes(member._id))) {
                member.isMember -= 1
                member.save()
            }
        }
        aircraftCrew["memberIds"] = memberIds
    } else {
        aircraftCrew["memberIds"] = []
    }

    const updatedAircraftCrew = await aircraftCrew.save()

    res.status(200).json({ "message": `AircraftCrew ${updatedAircraftCrew.name} updated.`})
})

// Document later
const deleteAircraftCrew = asyncHandler( async (req, res) => {
    const { id } = req.body

    // Validate input
    if (!id) {
        return res.status(400).json({"message": `Id of aircraft crew is required.`})
    }

    // Find crew
    const aircraftCrew = await AircraftCrew.findOne({ _id: id }).exec()
    if (!aircraftCrew) {
        return res.status(400).json({"message": `AircraftCrew with id ${id} does not exist.`})
    } 

    // Validate there is no flight planned for this crew
    const flights = await Flight.find({ aircraftCrewId: id}).select().lean()
    if (flights) {
        return res.status(400).json({"message": `AircraftCrew has ${flights.length} flights scheduled and therefore can not be deleted.`})
    }

    // Delete members gracefully
    let membersToDelete = []
    for (const memberId of aircraftCrew.memberIds) {
        let member = await User.findOne({ _id: memberId }).exec()
        if (member) {
            membersToDelete.push(member)
        }
    };
    for (const member of membersToDelete) {
        member.isMember -= 1
        member.save()
    }

    const result = await aircraftCrew.deleteOne()

    res.status(200).json({"message": `AircraftCrew with id ${result.id} successfully deleted.`})
})

module.exports = {
    listAircraftCrews,
    createAircraftCrew,
    updateAircraftCrew,
    deleteAircraftCrew,
}