const User = require('../models/User')
const Flight = require('../models/Flight')
const Maintenance = require('../models/Maintenance')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

/* 
Method: GET
Desc: List all users.
Par: <no>
*/
const listUsers = asyncHandler( async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.json([])
    }
    res.json(users)
})

/* 
Method: POST
Desc: Create an user.
Par:
- username: unique username
- password: password
- fullName: fullName
- email: proper email address
- roles: roles of user
*/
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

/* 
Method: PATCH
Desc: Update an user.
Par:
- id: id of existing user
- password: password
- fullName: fullName
- email: proper email address
- roles: roles of user
- userId: id of user that is trying to edit
*/
const updateUser = asyncHandler( async (req, res) => {
    const { id, password, fullName, email, roles, userId } = req.body

    const editingUser = await User.findOne({ _id: userId }).exec()
    if (!editingUser.roles.includes("Admin") && userId !== id) {
        return res.status(400).json({"message": `You are not allowed to edit different users.`})
    }

    // Check if user exists
    const user = await User.findOne({ _id: id }).exec()
    if (!user) {
        return res.status(400).json({"message": `User with id ${id} does not exist.`})
    }

    user.fullName = fullName
    user.email = email
    // We don't do complex check of roles, admin need to handle that
    user.roles = roles

    // Hash password
    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }
    const updatedUser = await user.save()

    res.status(200).json({ "message": `User ${updatedUser.username} updated.`})
})

/* 
Method: DELETE
Desc: Delete an user.
Par:
- id: id of existing user
*/
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

    // This methods needs to be called very carefully as we handle only flights and maintenances. Admin needs to be aware of that
    const flights = await Flight.find({ "plannedBy": id }).select().lean()
    if (flights?.length) {
        return res.status(400).json({"message": `There are scheduled flights planned by this user. Edit or delete them first.`})
    }

    const maintenances = await Maintenance.find({ "plannedBy": id }).select().lean()
    if (maintenances?.length) {
        return res.status(400).json({"message": `There are scheduled maintenances planned by this user. Edit or delete them first.`})
    }

    const result = await user.deleteOne()

    res.status(200).json({"message": `User ${result.username} successfully deleted.`})
})

module.exports = {
    listUsers,
    createUser,
    updateUser,
    deleteUser,
}