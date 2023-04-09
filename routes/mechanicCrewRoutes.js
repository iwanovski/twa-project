const express = require('express')
const router = express.Router()
const mechanicCrewsController = require('../controllers/mechanicCrewsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(mechanicCrewsController.listMechanicCrews)
    .post(mechanicCrewsController.createMechanicCrew)

module.exports = router