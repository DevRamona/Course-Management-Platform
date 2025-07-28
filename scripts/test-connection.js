const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing MySQL Connection...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'course_management_db'
  };

  console.log('📋 Connection Details:');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Database: ${config.database}`);
  console.log(`Password: ${config.password ? '***set***' : '***empty***'}\n`);

  try {
    // Test connection without database first
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });

    console.log('✅ MySQL connection successful!');

    // Check if database exists
    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${config.database}'`
    );

    if (rows.length === 0) {
      console.log(`📝 Creating database '${config.database}'...`);
      await connection.execute(`CREATE DATABASE \`${config.database}\``);
      console.log(`✅ Database '${config.database}' created successfully!`);
    } else {
      console.log(`✅ Database '${config.database}' already exists!`);
    }

    await connection.end();
    console.log('\n🎉 Database setup completed successfully!');
    console.log('🚀 You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your .env file has correct credentials');
    console.log('3. Try connecting manually: mysql -u root -p');
    console.log('4. If no password, set DB_PASSWORD= in your .env file');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection }; 