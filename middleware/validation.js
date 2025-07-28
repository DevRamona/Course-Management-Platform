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

const validateActivityLogCreate = [
  body('allocationId')
    .isInt({ min: 1 })
    .withMessage('Allocation ID must be a positive integer'),
  body('weekNumber')
    .isInt({ min: 1, max: 52 })
    .withMessage('Week number must be between 1 and 52'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('attendance')
    .optional()
    .isArray()
    .withMessage('Attendance must be an array'),
  body('formativeOneGrading')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Formative One Grading must be Done, Pending, or Not Started'),
  body('formativeTwoGrading')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Formative Two Grading must be Done, Pending, or Not Started'),
  body('summativeGrading')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Summative Grading must be Done, Pending, or Not Started'),
  body('courseModeration')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Course Moderation must be Done, Pending, or Not Started'),
  body('intranetSync')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Intranet Sync must be Done, Pending, or Not Started'),
  body('gradeBookStatus')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Grade Book Status must be Done, Pending, or Not Started'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  handleValidationErrors
];

const validateActivityLogUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Activity log ID must be a positive integer'),
  body('allocationId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Allocation ID must be a positive integer'),
  body('weekNumber')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('Week number must be between 1 and 52'),
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('attendance')
    .optional()
    .isArray()
    .withMessage('Attendance must be an array'),
  body('formativeOneGrading')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Formative One Grading must be Done, Pending, or Not Started'),
  body('formativeTwoGrading')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Formative Two Grading must be Done, Pending, or Not Started'),
  body('summativeGrading')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Summative Grading must be Done, Pending, or Not Started'),
  body('courseModeration')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Course Moderation must be Done, Pending, or Not Started'),
  body('intranetSync')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Intranet Sync must be Done, Pending, or Not Started'),
  body('gradeBookStatus')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Grade Book Status must be Done, Pending, or Not Started'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  handleValidationErrors
];

const validateActivityLogQuery = [
  query('facilitatorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Facilitator ID must be a positive integer'),
  query('allocationId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Allocation ID must be a positive integer'),
  query('weekNumber')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('Week number must be between 1 and 52'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  query('status')
    .optional()
    .isIn(['Done', 'Pending', 'Not Started'])
    .withMessage('Status must be Done, Pending, or Not Started'),
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
  validateActivityLogCreate,
  validateActivityLogUpdate,
  validateActivityLogQuery,
  validateModuleCreate
}; 