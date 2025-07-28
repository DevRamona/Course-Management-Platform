const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function resetMySQL() {
  console.log('🔧 MySQL Setup Helper\n');
  console.log('This script will help you set up MySQL for the Course Management Platform.\n');

  try {
    // Test common password combinations
    const commonPasswords = ['', 'root', 'password', 'admin', '123456'];
    
    console.log('🔍 Testing common MySQL passwords...\n');
    
    let workingConnection = null;
    let workingPassword = '';

    for (const password of commonPasswords) {
      try {
        console.log(`Testing password: "${password || '(empty)'}"`);
        
        const connection = await mysql.createConnection({
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: password
        });

        console.log(`✅ SUCCESS! Password is: "${password || '(empty)'}"`);
        workingConnection = connection;
        workingPassword = password;
        break;

      } catch (error) {
        console.log(`❌ Failed with password: "${password || '(empty)'}"`);
      }
    }

    if (!workingConnection) {
      console.log('\n❌ Could not connect with any common password.');
      console.log('\n💡 Manual steps to reset MySQL password:');
      console.log('1. Open MySQL Workbench');
      console.log('2. Go to Server → Users and Privileges');
      console.log('3. Find the "root" user and click "Edit"');
      console.log('4. Set a new password (e.g., "password123")');
      console.log('5. Run this script again');
      
      rl.close();
      return;
    }

    // Create database
    console.log('\n📝 Creating database...');
    await workingConnection.execute('CREATE DATABASE IF NOT EXISTS `course_management_db`');
    console.log('✅ Database created successfully!');

    await workingConnection.end();

    // Create .env file
    const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=course_management_db
DB_USER=root
DB_PASSWORD=${workingPassword}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info`;

    const fs = require('fs');
    fs.writeFileSync('.env', envContent);

    console.log('\n✅ .env file created with working credentials!');
    console.log(`📝 Password used: "${workingPassword || '(empty)'}"`);
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Run: node -e "require(\'./seeders/seedData\').seedData().then(() => process.exit())"');
    console.log('3. Your API will be available at http://localhost:3000');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Alternative solutions:');
    console.log('1. Reinstall MySQL Workbench');
    console.log('2. Use XAMPP/WAMP instead');
    console.log('3. Contact your system administrator');
  } finally {
    rl.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  resetMySQL();
}

module.exports = { resetMySQL }; 