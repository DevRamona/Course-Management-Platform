const { User, Module, Cohort, Class, Mode, CourseOffering } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Seed initial data for the Course Management Platform
 */
const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Create users
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    
    const users = await User.bulkCreate([
      {
        email: 'manager@university.edu',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Manager',
        role: 'manager'
      },
      {
        email: 'facilitator1@university.edu',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'facilitator'
      },
      {
        email: 'facilitator2@university.edu',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'facilitator'
      },
      {
        email: 'student@university.edu',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'student'
      }
    ]);

    console.log('✅ Users seeded');

    // Create modules
    const modules = await Module.bulkCreate([
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science and programming',
        credits: 3
      },
      {
        code: 'CS201',
        name: 'Data Structures and Algorithms',
        description: 'Advanced programming concepts and algorithm design',
        credits: 4
      },
      {
        code: 'CS301',
        name: 'Software Engineering',
        description: 'Software development methodologies and best practices',
        credits: 4
      },
      {
        code: 'MATH101',
        name: 'Calculus I',
        description: 'Introduction to differential and integral calculus',
        credits: 4
      },
      {
        code: 'ENG101',
        name: 'Academic Writing',
        description: 'Professional writing and communication skills',
        credits: 3
      }
    ]);

    console.log('✅ Modules seeded');

    // Create cohorts
    const cohorts = await Cohort.bulkCreate([
      {
        name: 'Class of 2024',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-15')
      },
      {
        name: 'Class of 2025',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-12-15')
      }
    ]);

    console.log('✅ Cohorts seeded');

    // Create classes
    const classes = await Class.bulkCreate([
      {
        name: '2024S',
        description: 'Spring 2024 Semester'
      },
      {
        name: '2024F',
        description: 'Fall 2024 Semester'
      },
      {
        name: '2025S',
        description: 'Spring 2025 Semester'
      }
    ]);

    console.log('✅ Classes seeded');

    // Create modes
    const modes = await Mode.bulkCreate([
      {
        name: 'online',
        description: 'Fully online delivery'
      },
      {
        name: 'in-person',
        description: 'Traditional classroom delivery'
      },
      {
        name: 'hybrid',
        description: 'Combination of online and in-person delivery'
      }
    ]);

    console.log('✅ Modes seeded');

    // Create course offerings
    const courseOfferings = await CourseOffering.bulkCreate([
      {
        moduleId: 1, // CS101
        classId: 1, // 2024S
        cohortId: 1, // Class of 2024
        facilitatorId: 2, // Sarah Johnson
        modeId: 2, // in-person
        trimester: 'HT1',
        intakePeriod: 'HT1',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        maxStudents: 30
      },
      {
        moduleId: 2, // CS201
        classId: 1, // 2024S
        cohortId: 1, // Class of 2024
        facilitatorId: 3, // Michael Chen
        modeId: 1, // online
        trimester: 'HT1',
        intakePeriod: 'HT1',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        maxStudents: 25
      },
      {
        moduleId: 3, // CS301
        classId: 2, // 2024F
        cohortId: 1, // Class of 2024
        facilitatorId: 2, // Sarah Johnson
        modeId: 3, // hybrid
        trimester: 'HT2',
        intakePeriod: 'HT2',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-15'),
        maxStudents: 20
      },
      {
        moduleId: 4, // MATH101
        classId: 1, // 2024S
        cohortId: 1, // Class of 2024
        facilitatorId: 3, // Michael Chen
        modeId: 2, // in-person
        trimester: 'HT1',
        intakePeriod: 'HT1',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        maxStudents: 35
      },
      {
        moduleId: 5, // ENG101
        classId: 1, // 2024S
        cohortId: 1, // Class of 2024
        facilitatorId: 2, // Sarah Johnson
        modeId: 1, // online
        trimester: 'HT1',
        intakePeriod: 'HT1',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        maxStudents: 40
      }
    ]);

    console.log('✅ Course offerings seeded');
    console.log('🎉 All seed data created successfully!');

    // Log created data for reference
    console.log('\n📊 Seed Data Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Modules: ${modules.length}`);
    console.log(`- Cohorts: ${cohorts.length}`);
    console.log(`- Classes: ${classes.length}`);
    console.log(`- Modes: ${modes.length}`);
    console.log(`- Course Offerings: ${courseOfferings.length}`);

    console.log('\n🔑 Test Accounts:');
    console.log('Manager: manager@university.edu / Password123!');
    console.log('Facilitator 1: facilitator1@university.edu / Password123!');
    console.log('Facilitator 2: facilitator2@university.edu / Password123!');
    console.log('Student: student@university.edu / Password123!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

module.exports = { seedData }; 