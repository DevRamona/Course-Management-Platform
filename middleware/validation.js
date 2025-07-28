const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(['manager', 'facilitator', 'student'])
    .withMessage('Role must be manager, facilitator, or student'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateCourseOfferingCreate = [
  body('moduleId')
    .isInt({ min: 1 })
    .withMessage('Module ID must be a positive integer'),
  body('classId')
    .isInt({ min: 1 })
    .withMessage('Class ID must be a positive integer'),
  body('cohortId')
    .isInt({ min: 1 })
    .withMessage('Cohort ID must be a positive integer'),
  body('facilitatorId')
    .isInt({ min: 1 })
    .withMessage('Facilitator ID must be a positive integer'),
  body('modeId')
    .isInt({ min: 1 })
    .withMessage('Mode ID must be a positive integer'),
  body('trimester')
    .isIn(['HT1', 'HT2', 'FT'])
    .withMessage('Trimester must be HT1, HT2, or FT'),
  body('intakePeriod')
    .isIn(['HT1', 'HT2', 'FT'])
    .withMessage('Intake period must be HT1, HT2, or FT'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('maxStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max students must be a positive integer'),
  handleValidationErrors
];

const validateCourseOfferingUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Course offering ID must be a positive integer'),
  body('moduleId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Module ID must be a positive integer'),
  body('classId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Class ID must be a positive integer'),
  body('cohortId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cohort ID must be a positive integer'),
  body('facilitatorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Facilitator ID must be a positive integer'),
  body('modeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Mode ID must be a positive integer'),
  body('trimester')
    .optional()
    .isIn(['HT1', 'HT2', 'FT'])
    .withMessage('Trimester must be HT1, HT2, or FT'),
  body('intakePeriod')
    .optional()
    .isIn(['HT1', 'HT2', 'FT'])
    .withMessage('Intake period must be HT1, HT2, or FT'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('maxStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max students must be a positive integer'),
  handleValidationErrors
];

const validateCourseOfferingQuery = [
  query('trimester')
    .optional()
    .isIn(['HT1', 'HT2', 'FT'])
    .withMessage('Trimester must be HT1, HT2, or FT'),
  query('intakePeriod')
    .optional()
    .isIn(['HT1', 'HT2', 'FT'])
    .withMessage('Intake period must be HT1, HT2, or FT'),
  query('facilitatorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Facilitator ID must be a positive integer'),
  query('modeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Mode ID must be a positive integer'),
  query('cohortId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cohort ID must be a positive integer'),
  query('moduleId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Module ID must be a positive integer'),
  handleValidationErrors
];

const validateModuleCreate = [
  body('code')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Module code must be between 2 and 20 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Module name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('credits')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Credits must be a non-negative integer'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCourseOfferingCreate,
  validateCourseOfferingUpdate,
  validateCourseOfferingQuery,
  validateModuleCreate
}; 