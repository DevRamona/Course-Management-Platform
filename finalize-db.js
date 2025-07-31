const mysql = require('mysql2/promise');

async function finalizeDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'course_management_db'
  });

  try {
    console.log('🚀 Finalizing database setup...');

    // Clear all existing data
    console.log('🧹 Clearing existing data...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE course_offerings');
    await connection.execute('TRUNCATE TABLE users');
    await connection.execute('TRUNCATE TABLE modes');
    await connection.execute('TRUNCATE TABLE cohorts');
    await connection.execute('TRUNCATE TABLE classes');
    await connection.execute('TRUNCATE TABLE modules');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Data cleared');

    // Insert fresh data
    console.log('📝 Inserting fresh data...');

    // Modules
    await connection.execute(`
      INSERT INTO modules (name, code, description, credits, is_active, created_at, updated_at) VALUES
      ('Advanced Programming', 'CS301', 'Advanced programming concepts and techniques', 3, 1, NOW(), NOW()),
      ('Database Systems', 'CS302', 'Database design and management', 3, 1, NOW(), NOW()),
      ('Web Development', 'CS303', 'Modern web development technologies', 3, 1, NOW(), NOW())
    `);

    // Classes
    await connection.execute(`
      INSERT INTO classes (name, description, is_active, created_at, updated_at) VALUES
      ('Class of 2024', 'Academic year 2024-2025', 1, NOW(), NOW()),
      ('Class of 2025', 'Academic year 2025-2026', 1, NOW(), NOW())
    `);

    // Cohorts
    await connection.execute(`
      INSERT INTO cohorts (name, description, is_active, created_at, updated_at) VALUES
      ('Cohort A', 'First cohort of the year', 1, NOW(), NOW()),
      ('Cohort B', 'Second cohort of the year', 1, NOW(), NOW())
    `);

    // Modes
    await connection.execute(`
      INSERT INTO modes (name, description, is_active, created_at, updated_at) VALUES
      ('Online', 'Fully online delivery', 1, NOW(), NOW()),
      ('In-person', 'Traditional classroom delivery', 1, NOW(), NOW()),
      ('Hybrid', 'Combined online and in-person', 1, NOW(), NOW())
    `);

    // Users
    await connection.execute(`
      INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES
      ('sarahsoozi@alu.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Soozi', 'manager', 1, NOW(), NOW()),
      ('peterokoye@alu.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Peter', 'Okoye', 'facilitator', 1, NOW(), NOW()),
      ('karolann65@ethereal.email', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Karolann', 'Morissette', 'facilitator', 1, NOW(), NOW()),
      ('facilitator@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael', 'Johnson', 'facilitator', 1, NOW(), NOW())
    `);

    // Course Offerings
    await connection.execute(`
      INSERT INTO course_offerings (module_id, class_id, cohort_id, facilitator_id, mode_id, trimester, intake_period, start_date, end_date, max_students, is_active, created_at, updated_at) VALUES
      (1, 1, 1, 2, 1, 'HT1', 'HT1', '2024-01-15', '2024-05-15', 30, 1, NOW(), NOW()),
      (2, 1, 1, 3, 2, 'HT1', 'HT1', '2024-01-15', '2024-05-15', 25, 1, NOW(), NOW())
    `);

    console.log('✅ Database finalized successfully!');
    console.log('\n🎯 Ready for your video walkthrough!');
    console.log('\n📋 Test Accounts:');
    console.log('Manager: sarahsoozi@alu.edu (Password123!)');
    console.log('Facilitator 1: peterokoye@alu.edu (Password123!)');
    console.log('Facilitator 2: karolann65@ethereal.email (Password123!)');
    console.log('Facilitator 3: facilitator@example.com (Password123!)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

finalizeDatabase(); 