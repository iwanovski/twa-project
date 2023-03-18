const express = require('express')
const router = express.Router()
const mechanicCrewsController = require('../controllers/mechanicCrewsController')

router.route('/')
    .get(mechanicCrewsController.listMechanicCrews)
    .post(mechanicCrewsController.createMechanicCrew)

module.exports = router