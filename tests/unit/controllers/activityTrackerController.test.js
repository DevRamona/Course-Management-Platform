const { 
  createActivityLog, 
  getActivityLogs, 
  getActivityLogById, 
  updateActivityLog, 
  deleteActivityLog,
  getFacilitatorActivityLogs,
  getActivityLogsByAllocation
} = require('../../../controllers/activityTrackerController');
const { ActivityTracker, CourseOffering, User, Module, Cohort, Class, Mode } = require('../../../models');
const { createNotification, createAlert } = require('../../../services/notificationService');

jest.mock('../../../models');
jest.mock('../../../services/notificationService');

describe('Activity Tracker Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: { id: 1, firstName: 'Test', lastName: 'Facilitator' },
      body: {},
      params: {},
      query: {}
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

  describe('createActivityLog', () => {
    it('should return 404 when course allocation not found', async () => {
      const logData = {
        allocationId: 999,
        weekNumber: 1,
        year: 2024
      };

      mockReq.body = logData;

      CourseOffering.findOne.mockResolvedValue(null);

      await createActivityLog(mockReq, mockRes);

      expect(CourseOffering.findOne).toHaveBeenCalledWith({
        where: { id: logData.allocationId, facilitatorId: mockReq.user.id, isActive: true }
      });
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Course allocation not found or not assigned to you'
      });
    });

    it('should return 400 when activity log already exists', async () => {
      const logData = {
        allocationId: 1,
        weekNumber: 1,
        year: 2024
      };

      mockReq.body = logData;

      const mockCourseAllocation = {
        id: 1,
        facilitatorId: 1,
        isActive: true
      };

      const existingLog = {
        id: 1,
        allocationId: 1,
        weekNumber: 1,
        year: 2024
      };

      CourseOffering.findOne.mockResolvedValue(mockCourseAllocation);
      ActivityTracker.findOne.mockResolvedValue(existingLog);

      await createActivityLog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Activity log already exists for this week and allocation'
      });
    });

    it('should handle database errors', async () => {
      const logData = {
        allocationId: 1,
        weekNumber: 1,
        year: 2024
      };

      mockReq.body = logData;

      CourseOffering.findOne.mockRejectedValue(new Error('Database error'));

      await createActivityLog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('getActivityLogs', () => {
    it('should return all activity logs for manager', async () => {
      const mockLogs = [
        {
          id: 1,
          allocationId: 1,
          weekNumber: 1,
          year: 2024,
          courseAllocation: {
            module: { name: 'Module 1' },
            facilitator: { firstName: 'John', lastName: 'Doe' }
          }
        },
        {
          id: 2,
          allocationId: 2,
          weekNumber: 2,
          year: 2024,
          courseAllocation: {
            module: { name: 'Module 2' },
            facilitator: { firstName: 'Jane', lastName: 'Smith' }
          }
        }
      ];

      ActivityTracker.findAndCountAll = jest.fn().mockResolvedValue({
        rows: mockLogs,
        count: mockLogs.length
      });

      await getActivityLogs(mockReq, mockRes);

      expect(ActivityTracker.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { isActive: true },
        include: expect.any(Array),
        order: expect.any(Array)
      }));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          activityLogs: mockLogs,
          pagination: expect.any(Object)
        }
      });
    });

    it('should handle database errors when getting logs', async () => {
      ActivityTracker.findAndCountAll.mockRejectedValue(new Error('Database error'));

      await getActivityLogs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('getActivityLogById', () => {
    it('should return specific activity log', async () => {
      const logId = 1;
      mockReq.params.id = logId;

      const mockLog = {
        id: logId,
        allocationId: 1,
        weekNumber: 1,
        year: 2024,
        courseAllocation: {
          module: { name: 'Test Module' },
          facilitator: { firstName: 'John', lastName: 'Doe' }
        }
      };

      ActivityTracker.findByPk.mockResolvedValue(mockLog);

      await getActivityLogById(mockReq, mockRes);

      expect(ActivityTracker.findByPk).toHaveBeenCalledWith(logId, expect.objectContaining({
        include: expect.any(Array)
      }));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { activityLog: mockLog }
      });
    });

    it('should return 404 when log not found', async () => {
      const logId = 999;
      mockReq.params.id = logId;

      ActivityTracker.findByPk.mockResolvedValue(null);

      await getActivityLogById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Activity log not found'
      });
    });
  });

  describe('updateActivityLog', () => {
    it('should update activity log successfully', async () => {
      const logId = 1;
      const updateData = {
        attendance: [true, false, true, true, true],
        formativeOneGrading: 'Done',
        notes: 'Updated notes'
      };

      mockReq.params.id = logId;
      mockReq.body = updateData;

      const mockLog = {
        id: logId,
        facilitatorId: 1,
        allocationId: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      ActivityTracker.findByPk.mockResolvedValue(mockLog);

      await updateActivityLog(mockReq, mockRes);

      expect(ActivityTracker.findByPk).toHaveBeenCalledWith(logId);
      expect(mockLog.update).toHaveBeenCalledWith(expect.objectContaining(updateData));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Activity log updated successfully'
      }));
    });

    it('should return 404 when log not found', async () => {
      const logId = 999;
      mockReq.params.id = logId;

      ActivityTracker.findByPk.mockResolvedValue(null);

      await updateActivityLog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Activity log not found'
      });
    });

    it('should return 403 when user is not the facilitator', async () => {
      const logId = 1;
      mockReq.params.id = logId;

      const mockLog = {
        id: logId,        
        allocationId: 1
      };

      ActivityTracker.findByPk.mockResolvedValue(mockLog);

      await updateActivityLog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'You can only update your own activity logs'
      });
    });
  });

  describe('deleteActivityLog', () => {
    it('should delete activity log successfully', async () => {
      const logId = 1;
      mockReq.params.id = logId;

      const mockLog = {
        id: logId,
        facilitatorId: 1,
        allocationId: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      ActivityTracker.findByPk.mockResolvedValue(mockLog);

      await deleteActivityLog(mockReq, mockRes);

      expect(ActivityTracker.findByPk).toHaveBeenCalledWith(logId);
      expect(mockLog.update).toHaveBeenCalledWith({ isActive: false });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Activity log deleted successfully'
      });
    });

    it('should return 404 when log not found', async () => {
      const logId = 999;
      mockReq.params.id = logId;

      ActivityTracker.findByPk.mockResolvedValue(null);

      await deleteActivityLog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Activity log not found'
      });
    });

    it('should return 403 when user is not the facilitator', async () => {
      const logId = 1;
      mockReq.params.id = logId;

      const mockLog = {
        id: logId,
        facilitatorId: 999, 
        allocationId: 1
      };

      ActivityTracker.findByPk.mockResolvedValue(mockLog);

      await deleteActivityLog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'You can only delete your own activity logs'
      });
    });
  });

  describe('getFacilitatorActivityLogs', () => {
    it('should return facilitator activity logs', async () => {
      const mockLogs = [
        {
          id: 1,
          allocationId: 1,
          weekNumber: 1,
          year: 2024,
          courseAllocation: {
            module: { name: 'Module 1' }
          }
        }
      ];

      ActivityTracker.findAll.mockResolvedValue(mockLogs);

      await getFacilitatorActivityLogs(mockReq, mockRes);

      expect(ActivityTracker.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { facilitatorId: mockReq.user.id, isActive: true },
        include: expect.any(Array),
        order: expect.any(Array)
      }));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { activityLogs: mockLogs }
      });
    });
  });

  describe('getActivityLogsByAllocation', () => {
    it('should return activity logs for specific allocation', async () => {
      const allocationId = 1;
      mockReq.params.allocationId = allocationId;

      const mockLogs = [
        {
          id: 1,
          allocationId: 1,
          weekNumber: 1,
          year: 2024
        }
      ];

      ActivityTracker.findAll.mockResolvedValue(mockLogs);

      await getActivityLogsByAllocation(mockReq, mockRes);

      expect(ActivityTracker.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { allocationId, isActive: true },
        include: expect.any(Array),
        order: expect.any(Array)
      }));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { activityLogs: mockLogs }
      });
    });
  });
}); 