const express = require('express');
const router = express.Router();
const courseOfferingController = require('../controllers/courseOfferingController');
const { 
  authenticateToken, 
  requireManager, 
  requireFacilitator 
} = require('../middleware/auth');
const { 
  validateCourseOfferingCreate, 
  validateCourseOfferingUpdate, 
  validateCourseOfferingQuery 
} = require('../middleware/validation');

router.use(authenticateToken);

router.get('/', validateCourseOfferingQuery, courseOfferingController.getCourseOfferings);

router.get('/:id', courseOfferingController.getCourseOfferingById);

router.post('/', requireManager, validateCourseOfferingCreate, courseOfferingController.createCourseOffering);

router.put('/:id', requireManager, validateCourseOfferingUpdate, courseOfferingController.updateCourseOffering);

router.delete('/:id', requireManager, courseOfferingController.deleteCourseOffering);

router.get('/facilitator/my-courses', requireFacilitator, courseOfferingController.getFacilitatorCourseOfferings);

module.exports = router; 