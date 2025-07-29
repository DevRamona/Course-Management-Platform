const request = require('supertest');
const app = require('../server');
const { StudentReflection, User, CourseOffering, Module, Cohort, Class, Mode } = require('../models');
const bcrypt = require('bcryptjs');

let studentToken, managerToken;
let testReflectionId;

describe('Student Reflection API', () => {
  beforeAll(async () => {
    await StudentReflection.destroy({ where: {} });
    await CourseOffering.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Module.destroy({ where: {} });
    await Cohort.destroy({ where: {} });
    await Class.destroy({ where: {} });
    await Mode.destroy({ where: {} });

    const hashedPassword = await bcrypt.hash('Password123!', 12);

    const users = await User.bulkCreate([
      {
        email: 'student@test.edu',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Student',
        role: 'student'
      },
      {
        email: 'manager@test.edu',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Manager',
        role: 'manager'
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

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@test.edu',
        password: 'Password123!'
      });

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@test.edu',
        password: 'Password123!'
      });

    studentToken = studentLogin.body.token;
    managerToken = managerLogin.body.token;
  });

  afterAll(async () => {
    await StudentReflection.destroy({ where: {} });
    await CourseOffering.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Module.destroy({ where: {} });
    await Cohort.destroy({ where: {} });
    await Class.destroy({ where: {} });
    await Mode.destroy({ where: {} });
  });

  describe('POST /api/student-reflection/reflections', () => {
    it('should create a new reflection for a student', async () => {
      const reflectionData = {
        courseOfferingId: 1,
        question1: 'I enjoyed the practical programming exercises and hands-on coding sessions.',
        question2: 'The most challenging part was understanding object-oriented programming concepts.',
        question3: 'More interactive examples would help reinforce the concepts better.',
        language: 'en'
      };

      const response = await request(app)
        .post('/api/student-reflection/reflections')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(reflectionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.question1).toBe(reflectionData.question1);
      expect(response.body.data.language).toBe('en');

      testReflectionId = response.body.data.id;
    });

    it('should not allow non-students to create reflections', async () => {
      const reflectionData = {
        courseOfferingId: 1,
        question1: 'Test question 1',
        question2: 'Test question 2',
        question3: 'Test question 3',
        language: 'en'
      };

      const response = await request(app)
        .post('/api/student-reflection/reflections')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(reflectionData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/student-reflection/reflections')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseOfferingId: 1,
          question1: 'Too short',
          question2: 'Also too short',
          question3: 'Short'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/student-reflection/reflections/:id', () => {
    it('should get a reflection by ID', async () => {
      const response = await request(app)
        .get(`/api/student-reflection/reflections/${testReflectionId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testReflectionId);
    });

    it('should return 404 for non-existent reflection', async () => {
      const response = await request(app)
        .get('/api/student-reflection/reflections/999')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/student-reflection/reflections/:id', () => {
    it('should update a reflection', async () => {
      const updateData = {
        question1: 'Updated question 1',
        question2: 'Updated question 2',
        question3: 'Updated question 3',
        language: 'fr'
      };

      const response = await request(app)
        .put(`/api/student-reflection/reflections/${testReflectionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.question1).toBe(updateData.question1);
      expect(response.body.data.language).toBe('fr');
    });
  });

  describe('GET /api/student-reflection/reflections', () => {
    it('should get paginated reflections for student', async () => {
      const response = await request(app)
        .get('/api/student-reflection/reflections')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/student-reflection/reflections?page=1&limit=5')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(5);
    });
  });

  describe('DELETE /api/student-reflection/reflections/:id', () => {
    it('should delete a reflection', async () => {
      const response = await request(app)
        .delete(`/api/student-reflection/reflections/${testReflectionId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/student-reflection/reflections/stats', () => {
    it('should get reflection statistics for managers', async () => {
      const response = await request(app)
        .get('/api/student-reflection/reflections/stats')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('languageStats');
      expect(response.body.data).toHaveProperty('totalReflections');
    });

    it('should not allow students to access stats', async () => {
      const response = await request(app)
        .get('/api/student-reflection/reflections/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
}); 