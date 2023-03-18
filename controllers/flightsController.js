const Flight = require('../models/Flight')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// Document later
const listFlights = asyncHandler( async (req, res) => {
    const airports = await Airport.find().select().lean()
    if (!airports?.length) {
        return res.status(400).json({ "message": "No airports found"})
    }
    res.json(airports)
})


// Document later
const createFlight = asyncHandler( async (req, res) => {
    const { name, concerningId } = req.body

    // Validate data
    if (!name) {
        return res.status(400).json({"message": "Field name is required"})
    }

    // Check duplicate
    const duplicate = await Role.findOne({ name }).lean().exec()

    if (duplicate) {
        return res.status(409).json({"message": "Duplicate role"})
    }

    // Hash pawword
    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = { username, "password": hashedPwd, roles }

    // Create and store new user
    const user = await User.create(userObject)

    if (user) {
        res.status(200).json({ "message": `New user ${username} created`})
    } else {
        res.status(400).json({ "message": "Invalid data"})
    }
})


module.exports = {
    listFlights,
    createFlight,
}