const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  console.log('🔄 Resetting database...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'course_management_db'
    });

    console.log('✅ Connected to database');

    // Drop all tables
    const tables = [
      'course_offerings',
      'users',
      'modules', 
      'cohorts',
      'classes',
      'modes'
    ];

    for (const table of tables) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not drop table ${table}:`, error.message);
      }
    }

    await connection.end();
    console.log('\n🎉 Database reset completed!');
    console.log('🚀 You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase }; 