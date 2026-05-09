const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', supervisorController.createSupervisor);
router.get('/', supervisorController.getAllSupervisors);
router.get('/:id', supervisorController.getSupervisorById);
router.put('/:id', supervisorController.updateSupervisor);
router.delete('/:id', supervisorController.deleteSupervisor);

module.exports = router;
