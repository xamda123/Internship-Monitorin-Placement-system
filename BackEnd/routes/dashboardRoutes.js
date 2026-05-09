const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/placement-trends', authMiddleware, dashboardController.getPlacementTrends);
router.get('/recent-activities', authMiddleware, dashboardController.getRecentActivities);
router.get('/pending-approvals', authMiddleware, dashboardController.getPendingApprovals);
router.get('/completion-rate', authMiddleware, dashboardController.getCompletionRate);

module.exports = router;
