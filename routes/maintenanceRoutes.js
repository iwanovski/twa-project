const express = require('express')
const router = express.Router()
const maintenanceController = require('../controllers/maintenancesController')

router.route('/')
    .get(maintenanceController.listMaintenances)
    .post(maintenanceController.createMaintenance)
    .delete(maintenanceController.deleteMaintenance)

module.exports = router