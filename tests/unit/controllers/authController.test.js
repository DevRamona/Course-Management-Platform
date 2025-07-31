const { register, login, getProfile } = require('../../../controllers/authController');
const { User } = require('../../../models');
const { generateToken } = require('../../../utils/auth');

jest.mock('../../../models');
jest.mock('../../../utils/auth');

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: 1 }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    jest.clearAllMocks();
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      };

      mockReq.body = userData;

      const mockUser = {
        id: 1,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      };

      const mockToken = 'mock-jwt-token';

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      generateToken.mockReturnValue(mockToken);

      await register(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(generateToken).toHaveBeenCalledWith(mockUser);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            role: mockUser.role
          },
          token: mockToken
        }
      });
    });

    it('should return error when user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      };

      mockReq.body = userData;

      User.findOne.mockResolvedValue({ id: 1, email: userData.email });

      await register(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(User.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists'
      });
    });

    it('should handle database errors during registration', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      };

      mockReq.body = userData;

      User.findOne.mockRejectedValue(new Error('Database error'));

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error during registration'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      mockReq.body = loginData;

      const mockUser = {
        id: 1,
        email: loginData.email,
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true)
      };

      const mockToken = 'mock-jwt-token';

      User.findOne.mockResolvedValue(mockUser);
      generateToken.mockReturnValue(mockToken);

      await login(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: loginData.email } });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockUser.update).toHaveBeenCalledWith({ lastLogin: expect.any(Date) });
      expect(generateToken).toHaveBeenCalledWith(mockUser);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            role: mockUser.role
          },
          token: mockToken
        }
      });
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      mockReq.body = loginData;

      User.findOne.mockResolvedValue(null);

      await login(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: loginData.email } });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should return error for inactive user', async () => {
      const loginData = {
        email: 'inactive@example.com',
        password: 'Password123!'
      };

      mockReq.body = loginData;

      const mockUser = {
        id: 1,
        email: loginData.email,
        isActive: false
      };

      User.findOne.mockResolvedValue(mockUser);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is deactivated'
      });
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      mockReq.body = loginData;

      const mockUser = {
        id: 1,
        email: loginData.email,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockResolvedValue(mockUser);

      await login(mockReq, mockRes);

      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should handle database errors during login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      mockReq.body = loginData;

      User.findOne.mockRejectedValue(new Error('Database error'));

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error during login'
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      };

      User.findByPk.mockResolvedValue(mockUser);

      await getProfile(mockReq, mockRes);

      expect(User.findByPk).toHaveBeenCalledWith(mockReq.user.id, {
        attributes: { exclude: ['password'] }
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser }
      });
    });

    it('should handle database errors when getting profile', async () => {
      User.findByPk.mockRejectedValue(new Error('Database error'));

      await getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });
}); 