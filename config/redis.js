const Redis = require('redis');
const Bull = require('bull');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
};

const createRedisClient = () => {
  const client = Redis.createClient(redisConfig);
  
  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
  
  client.on('connect', () => {
    console.log('✅ Redis client connected');
  });
  
  client.on('ready', () => {
    console.log('✅ Redis client ready');
  });
  
  return client;
};

const createQueue = (queueName) => {
  return new Bull(queueName, {
    redis: redisConfig
  });
};

const notificationQueue = createQueue('notifications');
const reminderQueue = createQueue('reminders');
const alertQueue = createQueue('alerts');

notificationQueue.on('error', (error) => {
  console.error('Notification queue error:', error);
});

reminderQueue.on('error', (error) => {
  console.error('Reminder queue error:', error);
});

alertQueue.on('error', (error) => {
  console.error('Alert queue error:', error);
});

module.exports = {
  createRedisClient,
  createQueue,
  notificationQueue,
  reminderQueue,
  alertQueue,
  redisConfig
}; 