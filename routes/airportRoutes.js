const express = require('express')
const router = express.Router()
const airportController = require('../controllers/airportsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(airportController.listAirports)
    .post(airportController.createAirport)
    .patch(airportController.updateAirport)
    .delete(airportController.deleteAirport)

module.exports = router