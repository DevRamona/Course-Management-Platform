const mysql = require('mysql2/promise');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupXAMPPPassword() {
  console.log('🔐 XAMPP MySQL Password Setup\n');
  
  try {
    // First, try to connect without password
    console.log('🔍 Testing connection without password...');
    
    let connection;
    try {
      connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: ''
      });
      console.log('✅ Connected without password');
    } catch (error) {
      console.log('❌ Could not connect without password');
      console.log('💡 Make sure XAMPP MySQL is running');
      rl.close();
      return;
    }

    // Ask user for password choice
    console.log('\n🔐 Password Setup Options:');
    console.log('1. Set password for root user');
    console.log('2. Create new user with password');
    console.log('3. Keep no password (development only)');
    
    const choice = await question('\nEnter your choice (1-3): ');
    
    let dbUser = 'root';
    let dbPassword = '';
    
    if (choice === '1') {
      // Set root password
      const newPassword = await question('Enter new password for root user: ');
      
      await connection.execute(`ALTER USER 'root'@'localhost' IDENTIFIED BY '${newPassword}'`);
      await connection.execute('FLUSH PRIVILEGES');
      
      console.log('✅ Root password set successfully!');
      dbPassword = newPassword;
      
    } else if (choice === '2') {
      // Create new user
      const newUser = await question('Enter new username (e.g., course_user): ');
      const newPassword = await question('Enter password for new user: ');
      
      await connection.execute(`CREATE USER '${newUser}'@'localhost' IDENTIFIED BY '${newPassword}'`);
      await connection.execute(`GRANT ALL PRIVILEGES ON *.* TO '${newUser}'@'localhost'`);
      await connection.execute('FLUSH PRIVILEGES');
      
      console.log(`✅ User '${newUser}' created successfully!`);
      dbUser = newUser;
      dbPassword = newPassword;
      
    } else if (choice === '3') {
      console.log('✅ Keeping no password (development mode)');
      dbPassword = '';
      
    } else {
      console.log('❌ Invalid choice');
      await connection.end();
      rl.close();
      return;
    }

    // Create database
    console.log('\n📝 Creating database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS `course_management_db`');
    console.log('✅ Database created successfully!');

    await connection.end();

    // Create .env file
    const envContent = `# Database Configuration (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=course_management_db
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info`;

    fs.writeFileSync('.env', envContent);

    console.log('\n✅ .env file created with database configuration!');
    console.log(`📝 Database user: ${dbUser}`);
    console.log(`📝 Password: ${dbPassword ? '***set***' : '***empty***'}`);
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Run: node -e "require(\'./seeders/seedData\').seedData().then(() => process.exit())"');
    console.log('3. Your API will be available at http://localhost:3000');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure XAMPP MySQL is running');
    console.log('2. Check if port 3306 is available');
    console.log('3. Try restarting XAMPP');
  } finally {
    rl.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  setupXAMPPPassword();
}

module.exports = { setupXAMPPPassword }; 