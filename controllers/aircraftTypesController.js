const AircraftType = require('../models/AircraftType')
const Aircraft = require('../models/Aircraft')
const asyncHandler = require('express-async-handler')

/* 
Method: Get
Desc: List all aircraft types.
Par: <no>
*/
const listAircraftTypes = asyncHandler( async (req, res) => {
    const airportTypes = await AircraftType.find().select().lean()
    if (!airportTypes?.length) {
        return res.json([])
    }
    res.json(airportTypes)
})


/* 
Method: POST
Desc: Create an aircraft type.
Par:
- name: name of aircraft type
- code: unique code of aircraft type
- weight: weight of aircraft type
- height: height of aircraft type
- width: width of aircraft type
- numberOfPlaces: number of places for passengers
*/
const createAircraftType = asyncHandler( async (req, res) => {
    const { name, code, weight, height, width, numberOfPlaces } = req.body

    // Validate data
    if (!name || !code || !weight || !height || !width || !numberOfPlaces) {
        return res.status(400).json({"message": "All fields are required"})
    }

    // Check duplicate
    const duplicate = await AircraftType.findOne({ code }).lean().exec()

    if (duplicate) {
        return res.status(409).json({"message": "Duplicate code"})
    }

    const aircraftTypeObject = { name, code, weight, height, width, numberOfPlaces }

    // Create and store new user
    const user = await AircraftType.create(aircraftTypeObject)

    if (user) {
        res.status(200).json({ "message": `New aircraft type ${code} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})

/* 
Method: PATCH
Desc: Update an aircraft type.
Par:
- id: id of existing aircraft type
- name: name of aircraft type
- weight: weight of aircraft type
- height: height of aircraft type
- width: width of aircraft type
- numberOfPlaces: number of places for passengers
*/
const updateAircraftType = asyncHandler( async (req, res) => {
    const { name, id, weight, height, width, numberOfPlaces } = req.body

    // Check if aircraft type exists
    const aircraftType = await AircraftType.findOne({ _id: id }).exec()
    if (!aircraftType) {
        return res.status(400).json({"message": `Aircraft type with id ${id} does not exist.`})
    }

    // Update fields
    aircraftType.name = name || aircraftType.name
    aircraftType.weight = weight || aircraftType.weight
    aircraftType.height = height || aircraftType.height
    aircraftType.width = width || aircraftType.width
    aircraftType.numberOfPlaces = numberOfPlaces || aircraftType.numberOfPlaces

    const updatedAircraftType = await aircraftType.save()

    res.status(200).json({ "message": `Aircraft type with code ${updatedAircraftType.code} updated.`})
})

/* 
Method: DELETE
Desc: Delete an aircraft type.
Par:
- id: id of existing aircraft type
*/
const deleteAircraftType = asyncHandler( async (req, res) => {
    const { id } = req.body

    // Validate input
    if (!id) {
        return res.status(400).json({"message": `Id is required.`})
    }

    // Find aircraftType
    const aircraftType = await AircraftType.findOne({ _id: id }).exec()
    if (!aircraftType) {
        return res.status(400).json({"message": `AircraftType with id ${id} does not exist.`})
    }

    // If there is at least one aircraft with this type, it fails
    const aircrafts = await Aircraft.find({"aircraftTypeCode": aircraftType.code}).select().lean()
    if (aircrafts.length) {
        return res.status(400).json({"message": `AircraftType is still present in ${aircrafts.length} aircrafts.`})
    }

    // Otherwise proceed with deletion
    const result = await aircraftType.deleteOne()

    res.status(200).json({"message": `AircraftType ${result.code} successfully deleted.`})
})

module.exports = {
    listAircraftTypes,
    createAircraftType,
    updateAircraftType,
    deleteAircraftType,
}