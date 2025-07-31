const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  isValidEmail, 
  validatePassword 
} = require('../../../utils/auth');

jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'student'
      };

      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      const result = generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      expect(result).toBe(mockToken);
    });

    it('should use environment variables for JWT configuration', () => {
      const originalEnv = process.env;
      process.env.JWT_SECRET = 'custom-secret';
      process.env.JWT_EXPIRES_IN = '1h';

      const mockUser = { id: 1, email: 'test@example.com', role: 'student' };
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'custom-secret',
        { expiresIn: '1h' }
      );

      process.env = originalEnv;
    });
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'Password123!';
      const hashedPassword = 'hashed-password';
      
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it('should handle bcrypt errors', async () => {
      const password = 'Password123!';
      const error = new Error('Bcrypt error');
      
      bcrypt.hash.mockRejectedValue(error);

      await expect(hashPassword(password)).rejects.toThrow('Bcrypt error');
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'Password123!';
      const hash = 'hashed-password';
      
      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'WrongPassword123!';
      const hash = 'hashed-password';
      
      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
    });

    it('should handle bcrypt compare errors', async () => {
      const password = 'Password123!';
      const hash = 'hashed-password';
      const error = new Error('Bcrypt compare error');
      
      bcrypt.compare.mockRejectedValue(error);

      await expect(comparePassword(password, hash)).rejects.toThrow('Bcrypt compare error');
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@numbers.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should return false for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test@.com',
        'test@example',
        'test.example.com'
      ];
      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail(123)).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const strongPassword = 'StrongPass123!';
      
      const result = validatePassword(strongPassword);

      expect(result).toEqual({
        isValid: true,
        message: 'Password is valid'
      });
    });

    it('should return invalid for password shorter than 8 characters', () => {
      const shortPassword = 'Short1';
      
      const result = validatePassword(shortPassword);

      expect(result).toEqual({
        isValid: false,
        message: 'Password must be at least 8 characters long'
      });
    });

    it('should return invalid for password without lowercase letter', () => {
      const noLowercasePassword = 'UPPERCASE123!';
      
      const result = validatePassword(noLowercasePassword);

      expect(result).toEqual({
        isValid: false,
        message: 'Password must contain at least one lowercase letter'
      });
    });

    it('should return invalid for password without uppercase letter', () => {
      const noUppercasePassword = 'lowercase123!';
      
      const result = validatePassword(noUppercasePassword);

      expect(result).toEqual({
        isValid: false,
        message: 'Password must contain at least one uppercase letter'
      });
    });

    it('should return invalid for password without number', () => {
      const noNumberPassword = 'NoNumbers!';
      
      const result = validatePassword(noNumberPassword);

      expect(result).toEqual({
        isValid: false,
        message: 'Password must contain at least one number'
      });
    });

    it('should handle edge cases', () => {
      expect(validatePassword('')).toEqual({
        isValid: false,
        message: 'Password must be at least 8 characters long'
      });

      expect(validatePassword(null)).toEqual({
        isValid: false,
        message: 'Password must be at least 8 characters long'
      });

      expect(validatePassword(undefined)).toEqual({
        isValid: false,
        message: 'Password must be at least 8 characters long'
      });
    });

    it('should validate complex passwords correctly', () => {
      const complexPasswords = [
        'MySecurePass123!',
        'Complex@Password456',
        'Test123!@#$%',
        'Abc123!def'
      ];

      complexPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('Password is valid');
      });
    });
  });
}); 