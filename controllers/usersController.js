const User = require('../models/User')
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

// Document later pokracovat na 2:08
const getUser = asyncHandler( async (req, res) => {

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

    const userObject = { username, "password": hashedPwd, fullName, email, roles }

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
    const { username, password, fullName, email, roles, newUsername } = req.body

    // Check if user exists
    const user = await User.findOne({ username }).exec()
    if (!user) {
        return res.status(400).json({"message": `User with username ${username} does not exist.`})
    }

    // Update simple parameters
    if (newUsername) {
        user.username = newUsername
    }
    user.fullName = fullName
    user.email = email
    user.roles = roles

    // Hash password
    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.status(200).json({ "message": `User ${updatedUser.username} updated.`})
})

// Document later
const deleteUser = asyncHandler( async (req, res) => {
    const { username } = req.body

    // Validate input
    if (!username) {
        return res.status(400).json({"message": `Username is required.`})
    }

    // Find user
    const user = await User.findOne({ username }).exec()
    if (!user) {
        return res.status(400).json({"message": `User with username ${username} does not exist.`})
    } 

    const result = await user.deleteOne()

    res.status(200).json({"message": `User ${result.username} successfully deleted.`})
})

module.exports = {
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
}