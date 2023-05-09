const MechanicCrew = require('../models/MechanicCrew')
const Airport = require('../models/Airport')
const AircraftType = require('../models/AircraftType')
const User = require('../models/User')
const Maintenance = require('../models/Maintenance')
const asyncHandler = require('express-async-handler')

/* 
Method: Get
Desc: List all mechanic crews.
Par: <no>
*/
const listMechanicCrews = asyncHandler( async (req, res) => {
    const mechanicCrews = await MechanicCrew.find().select().lean()
    if (!mechanicCrews?.length) {
        return res.json([])
    }
    res.json(mechanicCrews)
})


/* 
Method: POST
Desc: Create an mechanic crew.
Par:
- name: name of mechanic crew
- homeAirportCode: code of home airport
- aircraftTypeCodes: types of aircrafts crew can repair
- memberIds: ids of members (Mechanics)
*/
const createMechanicCrew = asyncHandler( async (req, res) => {
    const { name, homeAirportCode, memberIds, aircraftTypeCodes } = req.body

    // Validate data
    if (!name || !homeAirportCode || !aircraftTypeCodes || !aircraftTypeCodes.length || !memberIds || !memberIds.length) {
        return res.status(400).json({"message": "All fields are required!"})
    }

    const mechanicCrewObject = { name, homeAirportCode, aircraftTypeCodes, memberIds }

    // Check every object specified exists
    const airport = await Airport.findOne({ "code": homeAirportCode }).exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with code ${homeAirportCode} does not exist.`})
    }

    // Complex check of members
    let members = []
    for (const memberId of memberIds) {
        let member = await User.findOne({ _id: memberId }).exec()
        if (!member) {
            return res.status(400).json({"message": `User with id ${memberId} does not exist.`})
        }
        if (!member.roles.includes("Mechanic")) {
            return res.status(400).json({"message": `User with id ${memberId} is not mechanic.`})
        }
        members.push(member)
    };

    // Check that every aircraftType exists
    for (const aircraftTypeCode of aircraftTypeCodes) {
        let aircraftType = await AircraftType.findOne({ "code": aircraftTypeCode }).exec()
        if (!aircraftType) {
            return res.status(400).json({"message": `Aircraft type with code ${aircraftType} does not exist.`})
        }
    };

    // Needs to be here as looping aircraftTypes can still throw error
    for (const member of members) {
        member.isMember += 1
        await member.save()
    }

    // Create and store new mechanic crew
    const mechanicCrew = await MechanicCrew.create(mechanicCrewObject)

    if (mechanicCrew) {
        res.status(200).json({ "message": `Mechanic crew ${name} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

/* 
Method: PATCH
Desc: Update an mechanic crew.
Par:
- name: name of mechanic crew
- homeAirportCode: code of home airport
- aircraftTypeCodes: types of aircrafts crew can repair
- memberIds: ids of members (Mechanics)
*/
const updateMechanicCrew = asyncHandler( async (req, res) => {
    const { id, name, homeAirportCode, memberIds, aircraftTypeCodes } = req.body

    // Validate data
    if (!id || !name || !homeAirportCode || !aircraftTypeCodes || !aircraftTypeCodes.length || !memberIds || !memberIds.length) {
        return res.status(400).json({"message": "All fields are required!"})
    }

    // Find mechanicCrew
    const mechanicCrew = await MechanicCrew.findOne({ _id: id }).exec()
    if (!mechanicCrew) {
        return res.status(400).json({"message": `MechanicCrew with id ${id} does not exist.`})
    }

    mechanicCrew.name = name
    
    // Check every object specified exists
    const airport = await Airport.findOne({ "code": homeAirportCode }).exec()
    if (!airport) {
        return res.status(400).json({"message": `Airport with code ${homeAirportCode} does not exist.`})
    }

    // Update complex parameters
    for (const aircraftTypeCode of aircraftTypeCodes) {
        let aircraftType = await AircraftType.findOne({ "code": aircraftTypeCode }).exec()
        if (!aircraftType) {
            return res.status(400).json({"message": `Aircraft type with code ${aircraftType} does not exist.`})
        }
    };
    mechanicCrew.aircraftTypeCodes = aircraftTypeCodes

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
        if (!member.roles.includes("Mechanic")) {
            return res.status(400).json({"message": `User with id ${memberId} is not mechanic.`})
        }
        members.push(member)
    }

    // Now we need to update number of crews for new mechanics
    for (const member of members) { // New members
        if (!mechanicCrew.memberIds.includes(member._id.toString())) { // If mechanic not in current crew
            member.isMember += 1
            await member.save()
        }
    }

    // Downgrade number of crews for mechanics that are not part of this crew anymore
    let membersToDowngrade = []
    for (const formerMemberId of mechanicCrew.memberIds) { // For all current members
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
        if (!memberIds.includes(member._id.toString())) { // Double check that new crew does not include this user anymore
            member.isMember -= 1
            await member.save()
        }
    }
    mechanicCrew.memberIds = memberIds

    const updatedMechanicCrew = await mechanicCrew.save()

    res.status(200).json({ "message": `MechanicCrew ${updatedMechanicCrew.name} updated.`})
})

/* 
Method: DELETE
Desc: Delete an mechanic crew.
Par:
- id: id of existing mechanic crew
*/
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
    if (maintenances?.length) {
        return res.status(400).json({"message": `MechanicCrew has ${maintenances.length} maintenances scheduled and therefore can not be deleted.`})
    } 

    // Delete members gracefully
    let membersToDelete = []
    for (const memberId of mechanicCrew.memberIds) {
        let member = await User.findOne({ _id: memberId }).exec()
        if (member) {
            membersToDelete.push(member)
        }
    };
    for (const member of membersToDelete) {
        member.isMember -= 1
        await member.save()
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