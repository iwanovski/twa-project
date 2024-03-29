const express = require('express')
const router = express.Router()
const flightController = require('../controllers/flightsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(flightController.listFlights)
    .post(flightController.createFlight)
    .delete(flightController.deleteFlight)
    .patch(flightController.updateFlight)

module.exports = router