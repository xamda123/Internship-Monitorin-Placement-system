const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/dashboard-summary', reportController.getDashboardSummary);
router.get('/download-pdf', reportController.generateDashboardReport);
router.get('/students-pdf', reportController.generateStudentsReport);
router.get('/students-per-hospital', reportController.getStudentsPerHospital);
router.get('/internship-status', reportController.getInternshipStatusBreakdown);
router.get('/supervisor-summary', reportController.getSupervisorSummary);

module.exports = router;
