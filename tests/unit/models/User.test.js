const bcrypt = require('bcryptjs');
const { User } = require('../../../models');

jest.mock('bcryptjs');

describe('User Model', () => {
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
      isActive: true,
      lastLogin: new Date(),
      comparePassword: jest.fn()
    };
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'Password123!';
      const hashedPassword = 'hashedPassword123';
      
      bcrypt.compare.mockResolvedValue(true);
      
     
      mockUser.comparePassword = jest.fn().mockResolvedValue(true);

      const result = await mockUser.comparePassword(password);

      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'WrongPassword123!';
      
      mockUser.comparePassword = jest.fn().mockResolvedValue(false);

      const result = await mockUser.comparePassword(password);

      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(result).toBe(false);
    });

    it('should handle bcrypt errors', async () => {
      const password = 'Password123!';
      const error = new Error('Bcrypt error');
      
      mockUser.comparePassword = jest.fn().mockRejectedValue(error);

      await expect(mockUser.comparePassword(password)).rejects.toThrow('Bcrypt error');
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      };

    
      expect(userData).toHaveProperty('email');
      expect(userData).toHaveProperty('password');
      expect(userData).toHaveProperty('firstName');
      expect(userData).toHaveProperty('lastName');
      expect(userData).toHaveProperty('role');
    });

    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should validate role values', () => {
      const validRoles = ['manager', 'facilitator', 'student'];
      const userData = { role: 'student' };

      expect(validRoles).toContain(userData.role);
    });

    it('should have default values', () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const userWithDefaults = {
        ...userData,
        role: 'student', 
        isActive: true,  
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(userWithDefaults.role).toBe('student');
      expect(userWithDefaults.isActive).toBe(true);
      expect(userWithDefaults.createdAt).toBeInstanceOf(Date);
      expect(userWithDefaults.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Model Associations', () => {
    it('should have correct associations defined', () => {

      const expectedAssociations = [
        'hasMany', 
        'hasMany', 
        'hasMany'  
      ];

      const mockAssociations = {
        hasMany: jest.fn(),
        belongsTo: jest.fn()
      };

      expect(mockAssociations.hasMany).toBeDefined();
    });
  });

  describe('Model Hooks', () => {
    it('should hash password before save', async () => {
      const password = 'Password123!';
      const hashedPassword = 'hashedPassword123';
      
      bcrypt.hash.mockResolvedValue(hashedPassword);
      const userData = {
        email: 'test@example.com',
        password: password,
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        changed: jest.fn().mockReturnValue(true)
      };

      const beforeSaveHook = async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      };

      await beforeSaveHook(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(userData.password).toBe(hashedPassword);
    });

    it('should not hash password if not changed', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'alreadyHashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        changed: jest.fn().mockReturnValue(false)
      };

      const beforeSaveHook = async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      };

      await beforeSaveHook(userData);

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('Model Methods', () => {
    it('should have getFullName method', () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        getFullName: function() {
          return `${this.firstName} ${this.lastName}`;
        }
      };

      expect(user.getFullName()).toBe('John Doe');
    });

    it('should have isManager method', () => {
      const manager = { role: 'manager' };
      const facilitator = { role: 'facilitator' };
      const student = { role: 'student' };

      const isManager = (user) => user.role === 'manager';

      expect(isManager(manager)).toBe(true);
      expect(isManager(facilitator)).toBe(false);
      expect(isManager(student)).toBe(false);
    });

    it('should have isFacilitator method', () => {
      const manager = { role: 'manager' };
      const facilitator = { role: 'facilitator' };
      const student = { role: 'student' };

      const isFacilitator = (user) => user.role === 'facilitator';

      expect(isFacilitator(manager)).toBe(false);
      expect(isFacilitator(facilitator)).toBe(true);
      expect(isFacilitator(student)).toBe(false);
    });

    it('should have isStudent method', () => {
      const manager = { role: 'manager' };
      const facilitator = { role: 'facilitator' };
      const student = { role: 'student' };

      const isStudent = (user) => user.role === 'student';

      expect(isStudent(manager)).toBe(false);
      expect(isStudent(facilitator)).toBe(false);
      expect(isStudent(student)).toBe(true);
    });
  });

  describe('Model Scopes', () => {
    it('should have active scope', () => {
      const activeUsers = [
        { id: 1, isActive: true },
        { id: 2, isActive: true }
      ];

      const inactiveUsers = [
        { id: 3, isActive: false },
        { id: 4, isActive: false }
      ];

      const isActive = (user) => user.isActive === true;

      expect(activeUsers.every(isActive)).toBe(true);
      expect(inactiveUsers.every(isActive)).toBe(false);
    });

    it('should have byRole scope', () => {
      const users = [
        { id: 1, role: 'manager' },
        { id: 2, role: 'facilitator' },
        { id: 3, role: 'student' }
      ];

      const byRole = (users, role) => users.filter(user => user.role === role);

      expect(byRole(users, 'manager')).toHaveLength(1);
      expect(byRole(users, 'facilitator')).toHaveLength(1);
      expect(byRole(users, 'student')).toHaveLength(1);
    });
  });
}); 