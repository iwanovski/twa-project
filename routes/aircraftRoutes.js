const express = require('express')
const router = express.Router()
const aircraftController = require('../controllers/aircraftsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(aircraftController.listAircrafts)
    .post(aircraftController.createAircraft)

module.exports = router