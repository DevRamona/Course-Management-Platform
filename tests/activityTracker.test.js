const request = require('supertest');
const app = require('../server');
const { ActivityTracker, User, CourseOffering, Module, Cohort, Class, Mode } = require('../models');
const bcrypt = require('bcryptjs');

let managerToken, facilitatorToken, studentToken;
let testActivityLogId;

describe('Activity Tracker API', () => {
  beforeAll(async () => {
    await ActivityTracker.destroy({ where: {} });
    await CourseOffering.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Module.destroy({ where: {} });
    await Cohort.destroy({ where: {} });
    await Class.destroy({ where: {} });
    await Mode.destroy({ where: {} });

    const hashedPassword = await bcrypt.hash('Password123!', 12);

    const users = await User.bulkCreate([
      {
        email: 'manager@test.edu',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Manager',
        role: 'manager'
      },
      {
        email: 'facilitator@test.edu',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Facilitator',
        role: 'facilitator'
      },
      {
        email: 'student@test.edu',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Student',
        role: 'student'
      }
    ]);

    const modules = await Module.bulkCreate([
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        description: 'Fundamental concepts',
        credits: 3
      }
    ]);

    const cohorts = await Cohort.bulkCreate([
      {
        name: 'Class of 2024',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-15')
      }
    ]);

    const classes = await Class.bulkCreate([
      {
        name: '2024S',
        description: 'Spring 2024'
      }
    ]);

    const modes = await Mode.bulkCreate([
      {
        name: 'online',
        description: 'Online delivery'
      }
    ]);

    const courseOfferings = await CourseOffering.bulkCreate([
      {
        moduleId: 1,
        classId: 1,
        cohortId: 1,
        facilitatorId: 2,
        modeId: 1,
        trimester: 'HT1',
        intakePeriod: 'HT1',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        maxStudents: 30
      }
    ]);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@test.edu',
        password: 'Password123!'
      });
    managerToken = loginResponse.body.data.token;

    const facilitatorLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'facilitator@test.edu',
        password: 'Password123!'
      });
    facilitatorToken = facilitatorLoginResponse.body.data.token;

    const studentLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@test.edu',
        password: 'Password123!'
      });
    studentToken = studentLoginResponse.body.data.token;
  });

  afterAll(async () => {
    await ActivityTracker.destroy({ where: {} });
    await CourseOffering.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Module.destroy({ where: {} });
    await Cohort.destroy({ where: {} });
    await Class.destroy({ where: {} });
    await Mode.destroy({ where: {} });
  });

  describe('POST /api/activity-tracker', () => {
    it('should create activity log for facilitator', async () => {
      const activityLogData = {
        allocationId: 1,
        weekNumber: 1,
        year: 2024,
        attendance: [true, true, true, true, true],
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Not Started',
        summativeGrading: 'Not Started',
        courseModeration: 'Pending',
        intranetSync: 'Done',
        gradeBookStatus: 'Done',
        notes: 'Week 1 completed successfully'
      };

      const response = await request(app)
        .post('/api/activity-tracker')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(activityLogData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activityLog).toBeDefined();
      expect(response.body.data.activityLog.allocationId).toBe(1);
      expect(response.body.data.activityLog.weekNumber).toBe(1);
      expect(response.body.data.activityLog.year).toBe(2024);

      testActivityLogId = response.body.data.activityLog.id;
    });

    it('should reject activity log creation for non-facilitator', async () => {
      const activityLogData = {
        allocationId: 1,
        weekNumber: 2,
        year: 2024,
        attendance: [true, true, true, true, true],
        formativeOneGrading: 'Done'
      };

      const response = await request(app)
        .post('/api/activity-tracker')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(activityLogData);

      expect(response.status).toBe(403);
    });

    it('should reject duplicate activity log for same week and allocation', async () => {
      const activityLogData = {
        allocationId: 1,
        weekNumber: 1,
        year: 2024,
        attendance: [true, true, true, true, true],
        formativeOneGrading: 'Done'
      };

      const response = await request(app)
        .post('/api/activity-tracker')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(activityLogData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });

    it('should reject activity log for non-assigned allocation', async () => {
      const activityLogData = {
        allocationId: 999,
        weekNumber: 3,
        year: 2024,
        attendance: [true, true, true, true, true],
        formativeOneGrading: 'Done'
      };

      const response = await request(app)
        .post('/api/activity-tracker')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(activityLogData);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/activity-tracker/facilitator/my-logs', () => {
    it('should get facilitator activity logs', async () => {
      const response = await request(app)
        .get('/api/activity-tracker/facilitator/my-logs')
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activityLogs).toBeDefined();
      expect(response.body.data.activityLogs.length).toBeGreaterThan(0);
    });

    it('should filter logs by week number', async () => {
      const response = await request(app)
        .get('/api/activity-tracker/facilitator/my-logs?weekNumber=1')
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.activityLogs.every(log => log.weekNumber === 1)).toBe(true);
    });

    it('should reject access for non-facilitator', async () => {
      const response = await request(app)
        .get('/api/activity-tracker/facilitator/my-logs')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/activity-tracker', () => {
    it('should get all activity logs for manager', async () => {
      const response = await request(app)
        .get('/api/activity-tracker')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activityLogs).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter logs by facilitator', async () => {
      const response = await request(app)
        .get('/api/activity-tracker?facilitatorId=2')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.activityLogs.every(log => log.facilitatorId === 2)).toBe(true);
    });

    it('should reject access for non-manager', async () => {
      const response = await request(app)
        .get('/api/activity-tracker')
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/activity-tracker/:id', () => {
    it('should get specific activity log for manager', async () => {
      const response = await request(app)
        .get(`/api/activity-tracker/${testActivityLogId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activityLog.id).toBe(testActivityLogId);
    });

    it('should get specific activity log for facilitator (own log)', async () => {
      const response = await request(app)
        .get(`/api/activity-tracker/${testActivityLogId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.activityLog.id).toBe(testActivityLogId);
    });

    it('should return 404 for non-existent log', async () => {
      const response = await request(app)
        .get('/api/activity-tracker/999')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/activity-tracker/:id', () => {
    it('should update activity log for facilitator', async () => {
      const updateData = {
        formativeOneGrading: 'Done',
        courseModeration: 'Done',
        notes: 'Updated notes'
      };

      const response = await request(app)
        .put(`/api/activity-tracker/${testActivityLogId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activityLog.formativeOneGrading).toBe('Done');
      expect(response.body.data.activityLog.courseModeration).toBe('Done');
    });

    it('should update activity log for manager', async () => {
      const updateData = {
        notes: 'Manager updated notes'
      };

      const response = await request(app)
        .put(`/api/activity-tracker/${testActivityLogId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.activityLog.notes).toBe('Manager updated notes');
    });

    it('should reject update for non-owner facilitator', async () => {
      const updateData = {
        notes: 'Unauthorized update'
      };

      const response = await request(app)
        .put(`/api/activity-tracker/${testActivityLogId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/activity-tracker/:id', () => {
    it('should delete activity log for facilitator', async () => {
      const response = await request(app)
        .delete(`/api/activity-tracker/${testActivityLogId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject delete for non-owner', async () => {
      const response = await request(app)
        .delete(`/api/activity-tracker/${testActivityLogId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/activity-tracker/allocation/:allocationId', () => {
    it('should get activity logs by allocation for manager', async () => {
      const response = await request(app)
        .get('/api/activity-tracker/allocation/1')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activityLogs).toBeDefined();
    });

    it('should get activity logs by allocation for facilitator', async () => {
      const response = await request(app)
        .get('/api/activity-tracker/allocation/1')
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/activity-tracker/allocation/1?status=Done')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.activityLogs.every(log => 
        ['formativeOneGrading', 'formativeTwoGrading', 'summativeGrading', 
         'courseModeration', 'intranetSync', 'gradeBookStatus'].some(field => 
           log[field] === 'Done'
         )
      )).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/activity-tracker')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate enum values', async () => {
      const response = await request(app)
        .post('/api/activity-tracker')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          allocationId: 1,
          weekNumber: 1,
          year: 2024,
          formativeOneGrading: 'Invalid'
        });

      expect(response.status).toBe(400);
    });

    it('should validate week number range', async () => {
      const response = await request(app)
        .post('/api/activity-tracker')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          allocationId: 1,
          weekNumber: 60,
          year: 2024
        });

      expect(response.status).toBe(400);
    });
  });
}); 