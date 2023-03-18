const express = require('express')
const router = express.Router()
const userController = require('../controllers/usersController')

router.route('/')
    .get(userController.listUsers)
    .post(userController.createUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router