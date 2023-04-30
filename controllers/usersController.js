const User = require('../models/User')
const Flight = require('../models/Flight')
const Maintenance = require('../models/Maintenance')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// Document later
const listUsers = asyncHandler( async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({ "message": "No users found"})
    }
    res.json(users)
})

// Document later
const createUser = asyncHandler( async (req, res) => {
    const { username, password, fullName, email, roles } = req.body

    // Validate data
    if (!username || !password || !fullName || !email || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({"message": "All fields are required!"})
    }

    // Check duplicate
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({"message": "Duplicate username."})
    }

    // Hash pawword
    const hashedPwd = await bcrypt.hash(password, 10)

    const isMember = 0

    const userObject = { username, "password": hashedPwd, fullName, email, roles, isMember }

    // Create and store new user
    const user = await User.create(userObject)

    if (user) {
        res.status(200).json({ "message": `New user with username ${username} created.`})
    } else {
        res.status(400).json({ "message": "Invalid data."})
    }
})

// Document later
const updateUser = asyncHandler( async (req, res) => {
    const { id, username, password, fullName, email, roles } = req.body

    // Check if user exists
    const user = await User.findOne({ _id: id }).exec()
    if (!user) {
        return res.status(400).json({"message": `User with id ${id} does not exist.`})
    }

    // Update simple parameters
    //if (username) {
        //const existingUser = await User.findOne({ username }).exec()
        //if (existingUser._id != id) {
            //return res.status(400).json({"message": `User with username ${username} already exists.`})
        //}
        //user.username = username
    //}
    user.fullName = fullName
    user.email = email
    user.roles = roles
    // TODO remove when becomes unnecessary
    if (!user.isMember) {
        user.isMember = 0
    }

    // Hash password
    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }
    // TODO check pilots?
    const updatedUser = await user.save()

    res.status(200).json({ "message": `User ${updatedUser.username} updated.`})
})

// Document later
const deleteUser = asyncHandler( async (req, res) => {
    const { id } = req.body

    // Validate input
    if (!id) {
        return res.status(400).json({"message": `Id is required.`})
    }

    // Find user
    const user = await User.findOne({ _id: id }).exec()
    if (!user) {
        return res.status(400).json({"message": `User with id ${id} does not exist.`})
    } 

    // Check there are no flights or maintenances and isMember is 0
    if (user.isMember) {
        return res.status(400).json({"message": `User is still part of ${user.isMember} crews. Edit them first.`})
    }

    const flights = Flight.find({ "plannedBy": id }).select().lean()
    if (flights) {
        return res.status(400).json({"message": `There are scheduled flights planned by this user. Edit or delete them first.`})
    }

    const maintenances = Maintenance.find({ "plannedBy": id }).select().lean()
    if (maintenances) {
        return res.status(400).json({"message": `There are scheduled maintenances planned by this user. Edit or delete them first.`})
    }

    // TODO Check pilots

    const result = await user.deleteOne()

    res.status(200).json({"message": `User ${result.username} successfully deleted.`})
})

module.exports = {
    listUsers,
    createUser,
    updateUser,
    deleteUser,
}