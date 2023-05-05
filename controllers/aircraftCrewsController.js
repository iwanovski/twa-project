const AircraftCrew = require('../models/AircraftCrew')
const User = require('../models/User')
const Flight = require('../models/Flight')
const asyncHandler = require('express-async-handler')

/* 
Method: Get
Desc: List all aircraft crews.
Par: <no>
*/
const listAircraftCrews = asyncHandler( async (req, res) => {
    const aircraftCrews = await AircraftCrew.find().select().lean()
    if (!aircraftCrews?.length) {
        return res.json([])
    }
    res.json(aircraftCrews)
})


/* 
Method: POST
Desc: Create an aircraft crew.
Par:
- name: name of aircraft crew
- mainPilotId: id of main pilot
- secondPilotId: id of second pilot
- memberIds: ids of members (Stewards)
*/
const createAircraftCrew = asyncHandler( async (req, res) => {
    const { name, mainPilotId, secondPilotId, memberIds } = req.body

    // Validate data
    if (!name || !mainPilotId || !secondPilotId || !memberIds || !memberIds.length) {
        return res.status(400).json({"message": "All fields are required!"})
    }

    const aircraftCrewObject = { name, mainPilotId, secondPilotId, memberIds }

    // check pilots are pilots
    const mainPilot = await User.findOne({ _id: mainPilotId }).exec()
    if (!mainPilot) {
        return res.status(400).json({"message": `Main pilot with id ${mainPilotId} does not exist.`})
    }
    if (!mainPilot.roles.includes("Pilot")) {
        return res.status(400).json({"message": `User with id ${mainPilotId} is not pilot.`})
    }

    const secondPilot = await User.findOne({ _id: secondPilotId }).exec()
    if (!secondPilot) {
        return res.status(400).json({"message": `Second pilot with id ${secondPilotId} does not exist.`})
    }
    if (!secondPilot.roles.includes("Pilot")) {
        return res.status(400).json({"message": `User with id ${secondPilotId} is not pilot.`})
    }
    if (mainPilotId === secondPilotId) {
        return res.status(400).json({"message": `You need to provide two different pilots.`})
    }

    // Complex check of members
    let members = []
    for (const memberId of memberIds) {
        let member = await User.findOne({ _id: memberId }).exec()
        if (!member) {
            return res.status(400).json({"message": `User with id ${memberId} does not exist.`})
        }
        if (!member.roles.includes("Steward")) {
            return res.status(400).json({"message": `User with id ${memberId} is not steward.`})
        }
        members.push(member)
    };
    for (const member of members) {
        member.isMember += 1
        member.save()
    }

    // Create and store new user
    const aircraftCrew = await AircraftCrew.create(aircraftCrewObject)

    if (aircraftCrew) {
        res.status(200).json({ "message": `Aircraft crew ${name} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

/* 
Method: PATCH
Desc: Update an aircraft crew.
Par:
- id: id of existing aircraft crew
- name: name of aircraft crew
- mainPilotId: id of main pilot
- secondPilotId: id of second pilot
- memberIds: ids of members (Stewards)
*/
const updateAircraftCrew = asyncHandler( async (req, res) => {
    const { id, name, mainPilotId, secondPilotId, memberIds } = req.body

    // Validate data
    if (!id || !name || !mainPilotId || !secondPilotId || !memberIds || !memberIds.length) {
        return res.status(400).json({"message": "All fields are required!"})
    }

    // Check if aircraftCrew exists
    const aircraftCrew = await AircraftCrew.findOne({ _id: id }).exec()
    if (!aircraftCrew) {
        return res.status(400).json({"message": `AircraftCrew with id ${id} does not exist.`})
    }

    // Update fields and TODO validate pilots
    aircraftCrew.name = name || aircraftCrew.name

    // check pilots are pilots
    const mainPilot = await User.findOne({ _id: mainPilotId }).exec()
    if (!mainPilot) {
        return res.status(400).json({"message": `Main pilot with id ${mainPilotId} does not exist.`})
    }
    if (!mainPilot.roles.includes("Pilot")) {
        return res.status(400).json({"message": `User with id ${mainPilotId} is not pilot.`})
    }

    const secondPilot = await User.findOne({ _id: secondPilotId }).exec()
    if (!secondPilot) {
        return res.status(400).json({"message": `Second pilot with id ${secondPilotId} does not exist.`})
    }
    if (!secondPilot.roles.includes("Pilot")) {
        return res.status(400).json({"message": `User with id ${secondPilotId} is not pilot.`})
    }
    if (mainPilotId === secondPilotId) {
        return res.status(400).json({"message": `You need to provide two different pilots.`})
    }
    aircraftCrew.mainPilotId = mainPilotId
    aircraftCrew.secondPilotId = secondPilotId

    // Update members gracefully
    // First validate that all new members exist and have sufficient roles
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
        if (!member.roles.includes("Steward")) {
            return res.status(400).json({"message": `User with id ${memberId} is not steward.`})
        }
        members.push(member)
    }

    // Now we need to update number of crews for new stewards
    for (const member of members) { // New members
        if (!aircraftCrew.memberIds.includes(member._id)) { // If steward not in current crew
            member.isMember += 1
            member.save()
        }
    }

    // Downgrade number of crews for steward that are not part of this crew anymore
    let membersToDowngrade = []
    for (const formerMemberId of aircraftCrew.memberIds) { // For all current members
        if (!memberIds.includes(formerMemberId)) { // If new members does not include them
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
        if (!aircraftCrew.memberIds.includes(member._id)) { // Double check that new crew does not include this user anymore
            member.isMember -= 1
            member.save()
        }
    }
    aircraftCrew["memberIds"] = memberIds

    const updatedAircraftCrew = await aircraftCrew.save()

    res.status(200).json({ "message": `AircraftCrew ${updatedAircraftCrew.name} updated.`})
})

/* 
Method: DELETE
Desc: Delete an aircraft crew.
Par:
- id: id of existing aircraft crew
*/
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
    if (flights?.length) {
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