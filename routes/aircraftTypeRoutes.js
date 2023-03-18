const express = require('express')
const router = express.Router()
const aircraftTypeController = require('../controllers/aircraftTypesController')

router.route('/')
    .get(aircraftTypeController.listAircraftTypes)
    .post(aircraftTypeController.createAircraftType)
    .patch(aircraftTypeController.updateAircraftType)

module.exports = router