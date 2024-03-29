const express = require('express')
const router = express.Router()
const aircraftCrewsController = require('../controllers/aircraftCrewsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(aircraftCrewsController.listAircraftCrews)
    .post(aircraftCrewsController.createAircraftCrew)
    .patch(aircraftCrewsController.updateAircraftCrew)
    .delete(aircraftCrewsController.deleteAircraftCrew)

module.exports = router