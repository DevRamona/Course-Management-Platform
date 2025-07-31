const jwt = require('jsonwebtoken');
const { User } = require('../../../models');
const { 
  authenticateToken, 
  requireRole, 
  requireManager, 
  requireFacilitator, 
  requireManagerOrFacilitator 
} = require('../../../middleware/auth');

jest.mock('jsonwebtoken');
jest.mock('../../../models');

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and set user', async () => {
      const mockToken = 'valid-token';
      const mockDecoded = {
        userId: 1,
        email: 'test@example.com',
        role: 'student'
      };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'student',
        isActive: true
      };

      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(mockUser);

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET || 'fallback-secret');
      expect(User.findByPk).toHaveBeenCalledWith(mockDecoded.userId);
      expect(mockReq.user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no token provided', async () => {
      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token format is invalid', async () => {
      mockReq.headers.authorization = 'InvalidFormat token';

      await authenticateToken(mockReq, mockRes, mockNext);

    });

    it('should return 401 when user not found', async () => {
      const mockToken = 'valid-token';
      const mockDecoded = { userId: 1 };

      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(null);

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or inactive user'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is inactive', async () => {
      const mockToken = 'valid-token';
      const mockDecoded = { userId: 1 };
      const mockUser = {
        id: 1,
        isActive: false
      };

      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(mockUser);

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or inactive user'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      const mockToken = 'invalid-token';

      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', async () => {
      const mockToken = 'expired-token';

      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 for other JWT errors', async () => {
      const mockToken = 'error-token';

      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockImplementation(() => {
        throw new Error('Other JWT error');
      });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication error'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with required role', () => {
      const requiredRoles = ['manager', 'facilitator'];
      const middleware = requireRole(requiredRoles);

      mockReq.user = { role: 'manager' };

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow access for user with single required role', () => {
      const requiredRole = 'manager';
      const middleware = requireRole(requiredRole);

      mockReq.user = { role: 'manager' };

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for user without required role', () => {
      const requiredRoles = ['manager', 'facilitator'];
      const middleware = requireRole(requiredRoles);

      mockReq.user = { role: 'student' };

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when no user is authenticated', () => {
      const requiredRoles = ['manager'];
      const middleware = requireRole(requiredRoles);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireManager', () => {
    it('should allow access for manager', () => {
      mockReq.user = { role: 'manager' };

      requireManager(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-manager', () => {
      mockReq.user = { role: 'facilitator' };

      requireManager(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireFacilitator', () => {
    it('should allow access for facilitator', () => {
      mockReq.user = { role: 'facilitator' };

      requireFacilitator(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-facilitator', () => {
      mockReq.user = { role: 'student' };

      requireFacilitator(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireManagerOrFacilitator', () => {
    it('should allow access for manager', () => {
      mockReq.user = { role: 'manager' };

      requireManagerOrFacilitator(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow access for facilitator', () => {
      mockReq.user = { role: 'facilitator' };

      requireManagerOrFacilitator(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for student', () => {
      mockReq.user = { role: 'student' };

      requireManagerOrFacilitator(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 