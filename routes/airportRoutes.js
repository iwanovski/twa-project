const express = require('express')
const router = express.Router()
const airportController = require('../controllers/airportsController')

router.route('/')
    .get(airportController.listAirports)
    .post(airportController.createAirport)

module.exports = router