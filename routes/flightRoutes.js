const express = require('express')
const router = express.Router()
const flightController = require('../controllers/flightsController')

router.route('/')
    .get(flightController.listFlights)
    .post(flightController.createFlight)

module.exports = router