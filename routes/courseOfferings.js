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

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/course-offerings - Get all course offerings (with filtering)
router.get('/', validateCourseOfferingQuery, courseOfferingController.getCourseOfferings);

// GET /api/course-offerings/:id - Get course offering by ID
router.get('/:id', courseOfferingController.getCourseOfferingById);

// POST /api/course-offerings - Create new course offering (Managers only)
router.post('/', requireManager, validateCourseOfferingCreate, courseOfferingController.createCourseOffering);

// PUT /api/course-offerings/:id - Update course offering (Managers only)
router.put('/:id', requireManager, validateCourseOfferingUpdate, courseOfferingController.updateCourseOffering);

// DELETE /api/course-offerings/:id - Delete course offering (Managers only)
router.delete('/:id', requireManager, courseOfferingController.deleteCourseOffering);

// GET /api/course-offerings/facilitator/my-courses - Get facilitator's assigned courses
router.get('/facilitator/my-courses', requireFacilitator, courseOfferingController.getFacilitatorCourseOfferings);

module.exports = router; 