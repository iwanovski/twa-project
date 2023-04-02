const Role = require('../models/Role')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// Document later
const listRoles = asyncHandler( async (req, res) => {
    const roles = await Role.find().select().lean()
    if (!roles?.length) {
        return res.status(400).json({ "message": "No roles found."})
    }
    res.json(roles)
})


// Document later
const createRole = asyncHandler( async (req, res) => {
    const { name, concerningId } = req.body

    // Validate data
    if (!name) {
        return res.status(400).json({"message": "Field name is required."})
    }

    let query = { name }
    if (concerningId) {
        query.concerningId = concerningId
    } else {
        query.concerningId = ""
    }

    // Check duplicate
    const duplicate = await Role.findOne(query).lean().exec()

    if (duplicate) {
        return res.status(409).json({"message": "Duplicate role."})
    }


    const roleObject = { name }
    if (concerningId) {
        roleObject.concerningId = concerningId
    }

    // Create and store new user
    const role = await Role.create(roleObject)

    if (role) {
        if (concerningId) {
            res.status(200).json({ "message": `New role ${name} with concerningId ${concerningId} created.`})
        } else {
            res.status(200).json({ "message": `New role ${name} created.`})
        }
        
    } else {
        res.status(400).json({ "message": "Invalid data."})
    }
})

// Document later
const deleteRole = asyncHandler( async (req, res) => {
    const { name, concerningId } = req.body

    // Validate input
    if (!name) {
        return res.status(400).json({"message": `Name is required.`})
    }

    let query = { name }
    if (concerningId) {
        query.concerningId = concerningId
    } else {
        query.concerningId = ""
    }

    // Find role
    const role = await Role.findOne(query).exec()
    if (!role) {
        if (concerningId) {
            return res.status(400).json({"message": `Role with name ${name} and concerningId ${concerningId} does not exist.`})
        }
        return res.status(400).json({"message": `Role with name ${name} does not exist.`})
    } 

    const result = await role.deleteOne()

    res.status(200).json({"message": `Role ${result.name} successfully deleted.`})
})

module.exports = {
    listRoles,
    createRole,
    deleteRole,
}