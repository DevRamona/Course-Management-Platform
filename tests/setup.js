const { sequelize } = require('../models');

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
});