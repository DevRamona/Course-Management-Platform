const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateRole, handleValidationErrors } = require('../middleware/validation');
const {
    createReflection,
    getReflection,
    updateReflection,
    deleteReflection,
    getStudentReflections,
    getReflectionStats
} = require('../controllers/studentReflectionController');

const reflectionValidation = [
    body('courseOfferingId')
        .isInt({ min: 1 })
        .withMessage('Course offering ID must be a positive integer'),
    body('question1')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Question 1 must be between 10 and 1000 characters'),
    body('question2')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Question 2 must be between 10 and 1000 characters'),
    body('question3')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Question 3 must be between 10 and 1000 characters'),
    body('language')
        .optional()
        .isIn(['en', 'fr', 'es'])
        .withMessage('Language must be en, fr, or es'),
    handleValidationErrors
];

const updateReflectionValidation = [
    body('question1')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Question 1 must be between 10 and 1000 characters'),
    body('question2')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Question 2 must be between 10 and 1000 characters'),
    body('question3')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Question 3 must be between 10 and 1000 characters'),
    body('language')
        .optional()
        .isIn(['en', 'fr', 'es'])
        .withMessage('Language must be en, fr, or es'),
    handleValidationErrors
];

const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('courseOfferingId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Course offering ID must be a positive integer'),
    handleValidationErrors
];

const idValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Reflection ID must be a positive integer'),
    handleValidationErrors
];

router.post('/reflections', auth, validateRole(['student']), reflectionValidation, createReflection);

router.get('/reflections/:id', auth, idValidation, getReflection);

router.put('/reflections/:id', auth, idValidation, updateReflectionValidation, updateReflection);

router.delete('/reflections/:id', auth, idValidation, deleteReflection);

router.get('/reflections', auth, paginationValidation, getStudentReflections);

router.get('/reflections/stats', auth, validateRole(['manager', 'facilitator']), getReflectionStats);

module.exports = router; 