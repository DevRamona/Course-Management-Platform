const { exec } = require('child_process');
const os = require('os');

function checkMySQLStatus() {
  console.log('🔍 Checking MySQL Status...\n');
  
  const platform = os.platform();
  
  if (platform === 'win32') {
    // Windows
    console.log('🪟 Windows detected');
    console.log('\n📋 Checking MySQL services...');
    
    exec('sc query mysql', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ MySQL service not found');
        console.log('\n💡 Solutions for Windows:');
        console.log('1. Install XAMPP: https://www.apachefriends.org/');
        console.log('2. Install WAMP: https://www.wampserver.com/');
        console.log('3. Install MySQL Server: https://dev.mysql.com/downloads/mysql/');
        console.log('\n🚀 Quick fix - Install XAMPP:');
        console.log('- Download and install XAMPP');
        console.log('- Start MySQL from XAMPP Control Panel');
        console.log('- Use these credentials in .env:');
        console.log('  DB_USER=root');
        console.log('  DB_PASSWORD=');
      } else {
        console.log('✅ MySQL service found');
        console.log(stdout);
        
        // Try to start MySQL
        console.log('\n🔄 Attempting to start MySQL...');
        exec('net start mysql', (startError, startStdout, startStderr) => {
          if (startError) {
            console.log('❌ Could not start MySQL automatically');
            console.log('💡 Try starting it manually:');
            console.log('- Open Services (services.msc)');
            console.log('- Find "MySQL" service');
            console.log('- Right-click and select "Start"');
          } else {
            console.log('✅ MySQL started successfully!');
            console.log('🚀 You can now run: npm run dev');
          }
        });
      }
    });
    
  } else if (platform === 'darwin') {
    // macOS
    console.log('🍎 macOS detected');
    console.log('\n📋 Checking MySQL...');
    
    exec('brew services list | grep mysql', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ MySQL not found via Homebrew');
        console.log('\n💡 Solutions for macOS:');
        console.log('1. Install MySQL: brew install mysql');
        console.log('2. Start MySQL: brew services start mysql');
        console.log('3. Or install MAMP: https://www.mamp.info/');
      } else {
        console.log('✅ MySQL found');
        console.log(stdout);
        
        // Try to start MySQL
        console.log('\n🔄 Starting MySQL...');
        exec('brew services start mysql', (startError, startStdout, startStderr) => {
          if (startError) {
            console.log('❌ Could not start MySQL');
          } else {
            console.log('✅ MySQL started successfully!');
            console.log('🚀 You can now run: npm run dev');
          }
        });
      }
    });
    
  } else {
    // Linux
    console.log('🐧 Linux detected');
    console.log('\n📋 Checking MySQL...');
    
    exec('systemctl status mysql', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ MySQL not running');
        console.log('\n💡 Solutions for Linux:');
        console.log('1. Install MySQL: sudo apt install mysql-server');
        console.log('2. Start MySQL: sudo systemctl start mysql');
        console.log('3. Enable MySQL: sudo systemctl enable mysql');
      } else {
        console.log('✅ MySQL is running');
        console.log(stdout);
        console.log('🚀 You can now run: npm run dev');
      }
    });
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkMySQLStatus();
}

module.exports = { checkMySQLStatus }; 