const express = require('express')
const router = express.Router()
const aircraftCrewsController = require('../controllers/aircraftCrewsController')

router.route('/')
    .get(aircraftCrewsController.listAircraftCrews)
    .post(aircraftCrewsController.createAircraftCrew)

module.exports = router