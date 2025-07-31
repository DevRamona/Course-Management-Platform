const { validationResult } = require('express-validator');
const {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCourseOfferingCreate,
  validateCourseOfferingUpdate,
  validateActivityLogCreate,
  validateActivityLogUpdate,
  validateStudentReflectionCreate,
  validateStudentReflectionUpdate,
  validateRole
} = require('../../../middleware/validation');

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  body: jest.fn(() => ({
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isISO8601: jest.fn().mockReturnThis(),
    isArray: jest.fn().mockReturnThis()
  })),
  param: jest.fn(() => ({
    isInt: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis()
  })),
  query: jest.fn(() => ({
    optional: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis()
  }))
}));

describe('Validation Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { role: 'student' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('validateUserRegistration should be an array of validation functions', () => {
    expect(Array.isArray(validateUserRegistration)).toBe(true);
    expect(validateUserRegistration.length).toBeGreaterThan(0);
  });

  it('validateUserLogin should be an array of validation functions', () => {
    expect(Array.isArray(validateUserLogin)).toBe(true);
    expect(validateUserLogin.length).toBeGreaterThan(0);
  });

  it('validateCourseOfferingCreate should be an array of validation functions', () => {
    expect(Array.isArray(validateCourseOfferingCreate)).toBe(true);
    expect(validateCourseOfferingCreate.length).toBeGreaterThan(0);
  });

  it('validateCourseOfferingUpdate should be an array of validation functions', () => {
    expect(Array.isArray(validateCourseOfferingUpdate)).toBe(true);
    expect(validateCourseOfferingUpdate.length).toBeGreaterThan(0);
  });

  it('validateActivityLogCreate should be an array of validation functions', () => {
    expect(Array.isArray(validateActivityLogCreate)).toBe(true);
    expect(validateActivityLogCreate.length).toBeGreaterThan(0);
  });

  it('validateActivityLogUpdate should be an array of validation functions', () => {
    expect(Array.isArray(validateActivityLogUpdate)).toBe(true);
    expect(validateActivityLogUpdate.length).toBeGreaterThan(0);
  });

  it('validateStudentReflectionCreate should be an array of validation functions', () => {
    expect(Array.isArray(validateStudentReflectionCreate)).toBe(true);
    expect(validateStudentReflectionCreate.length).toBeGreaterThan(0);
  });

  it('validateStudentReflectionUpdate should be an array of validation functions', () => {
    expect(Array.isArray(validateStudentReflectionUpdate)).toBe(true);
    expect(validateStudentReflectionUpdate.length).toBeGreaterThan(0);
  });

  describe('validateRole', () => {
    it('should return 403 when user does not have required role', () => {
      const middleware = validateRole(['manager', 'facilitator']);
      mockReq.user = { role: 'student' };
      middleware(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Required role: manager or facilitator'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
    it('should deny access for single role when user has different role', () => {
      const middleware = validateRole(['manager']);
      mockReq.user = { role: 'facilitator' };
      middleware(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Required role: manager'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 