const express = require('express')
const router = express.Router()
const aircraftTypeController = require('../controllers/aircraftTypesController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(aircraftTypeController.listAircraftTypes)
    .post(aircraftTypeController.createAircraftType)
    .patch(aircraftTypeController.updateAircraftType)

module.exports = router