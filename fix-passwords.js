const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'course_management_db'
  });

  try {
    console.log('🔧 Fixing user passwords...');
    
    // Hash the correct password
    const correctPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(correctPassword, 12);
    
    console.log('New password hash:', hashedPassword);
    
    // Update all user passwords
    await connection.execute(`
      UPDATE users 
      SET password = ? 
      WHERE email IN ('sarahsoozi@alu.edu', 'peterokoye@alu.edu', 'karolann65@ethereal.email', 'facilitator@example.com')
    `, [hashedPassword]);
    
    console.log('✅ Passwords updated successfully!');
    console.log('\n📋 Test Accounts (all use Password123!):');
    console.log('Manager: sarahsoozi@alu.edu');
    console.log('Facilitator 1: peterokoye@alu.edu');
    console.log('Facilitator 2: karolann65@ethereal.email');
    console.log('Facilitator 3: facilitator@example.com');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixPasswords(); 