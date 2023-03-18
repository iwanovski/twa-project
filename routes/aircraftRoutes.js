const express = require('express')
const router = express.Router()
const aircraftController = require('../controllers/aircraftsController')

router.route('/')
    .get(aircraftController.listAircrafts)
    .post(aircraftController.createAircraft)

module.exports = router