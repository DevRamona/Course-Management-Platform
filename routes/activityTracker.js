const express = require('express');
const router = express.Router();
const activityTrackerController = require('../controllers/activityTrackerController');
const { 
  authenticateToken, 
  requireManager, 
  requireFacilitator,
  requireManagerOrFacilitator
} = require('../middleware/auth');
const { 
  validateActivityLogCreate, 
  validateActivityLogUpdate, 
  validateActivityLogQuery 
} = require('../middleware/validation');

router.use(authenticateToken);

router.get('/', requireManager, validateActivityLogQuery, activityTrackerController.getActivityLogs);

router.get('/facilitator/my-logs', requireFacilitator, validateActivityLogQuery, activityTrackerController.getFacilitatorActivityLogs);

router.get('/allocation/:allocationId', requireManagerOrFacilitator, validateActivityLogQuery, activityTrackerController.getActivityLogsByAllocation);

router.get('/:id', requireManagerOrFacilitator, activityTrackerController.getActivityLogById);

router.post('/', requireFacilitator, validateActivityLogCreate, activityTrackerController.createActivityLog);

router.put('/:id', requireManagerOrFacilitator, validateActivityLogUpdate, activityTrackerController.updateActivityLog);

router.delete('/:id', requireManagerOrFacilitator, activityTrackerController.deleteActivityLog);

module.exports = router; 