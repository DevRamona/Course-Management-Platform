const { seedData } = require('../seeders/seedData');

console.log('🌱 Starting database seeding...');

seedData()
  .then(() => {
    console.log('✅ Database seeding completed successfully!');
    console.log('\n🔑 Test Accounts:');
    console.log('Manager: manager@university.edu / Password123!');
    console.log('Facilitator 1: facilitator1@university.edu / Password123!');
    console.log('Facilitator 2: facilitator2@university.edu / Password123!');
    console.log('Student: student@university.edu / Password123!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }); 