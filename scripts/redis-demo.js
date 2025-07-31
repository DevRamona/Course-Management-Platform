const Redis = require('redis');
const Bull = require('bull');
const { createRedisClient, createQueue, notificationQueue, reminderQueue, alertQueue } = require('../config/redis');

// Demo configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null
};

console.log('🚀 Redis Database Demonstration');
console.log('================================\n');

// 1. Basic Redis Client Demo
async function demonstrateBasicRedis() {
  console.log('📊 1. Basic Redis Operations');
  console.log('----------------------------');
  
  const client = createRedisClient();
  
  try {
    await client.connect();
    
    // Set some demo data
    await client.set('demo:user:1', JSON.stringify({
      id: 1,
      name: 'John Doe',
      role: 'facilitator',
      lastLogin: new Date().toISOString()
    }));
    
    await client.set('demo:activity:count', '15');
    await client.set('demo:system:status', 'active');
    
    // Get the data back
    const userData = await client.get('demo:user:1');
    const activityCount = await client.get('demo:activity:count');
    const systemStatus = await client.get('demo:system:status');
    
    console.log('✅ User Data:', JSON.parse(userData));
    console.log('✅ Activity Count:', activityCount);
    console.log('✅ System Status:', systemStatus);
    
    // List all demo keys
    const keys = await client.keys('demo:*');
    console.log('✅ Demo Keys:', keys);
    
    await client.disconnect();
  } catch (error) {
    console.error('❌ Basic Redis demo failed:', error.message);
  }
}

// 2. Bull Queue Demo
async function demonstrateBullQueues() {
  console.log('\n📋 2. Bull Queue Operations');
  console.log('----------------------------');
  
  try {
    // Add jobs to different queues
    const notificationJob = await notificationQueue.add('demo_notification', {
      type: 'activity_log_submitted',
      facilitatorId: 1,
      moduleName: 'Advanced Programming',
      weekNumber: 5,
      year: 2024,
      timestamp: new Date().toISOString()
    });
    
    const reminderJob = await reminderQueue.add('demo_reminder', {
      facilitatorId: 2,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      type: 'weekly_activity_reminder'
    });
    
    const alertJob = await alertQueue.add('demo_alert', {
      managerId: 1,
      alertType: 'missed_deadline',
      data: {
        facilitatorName: 'Jane Smith',
        moduleName: 'Database Systems',
        weekNumber: 4,
        year: 2024
      }
    });
    
    console.log('✅ Notification Job ID:', notificationJob.id);
    console.log('✅ Reminder Job ID:', reminderJob.id);
    console.log('✅ Alert Job ID:', alertJob.id);
    
    // Get queue statistics
    const notificationStats = await notificationQueue.getJobCounts();
    const reminderStats = await reminderQueue.getJobCounts();
    const alertStats = await alertQueue.getJobCounts();
    
    console.log('✅ Notification Queue Stats:', notificationStats);
    console.log('✅ Reminder Queue Stats:', reminderStats);
    console.log('✅ Alert Queue Stats:', alertStats);
    
  } catch (error) {
    console.error('❌ Bull queue demo failed:', error.message);
  }
}

// 3. Redis Data Structures Demo
async function demonstrateDataStructures() {
  console.log('\n🗂️  3. Redis Data Structures');
  console.log('----------------------------');
  
  const client = createRedisClient();
  
  try {
    await client.connect();
    
    // Hash - Store facilitator activity data
    await client.hSet('facilitator:1:activity', {
      'total_logs': '25',
      'last_submission': new Date().toISOString(),
      'compliance_rate': '95.2',
      'pending_logs': '2'
    });
    
    // List - Store recent activity log IDs
    await client.lPush('recent_activity_logs', ['101', '102', '103', '104', '105']);
    
    // Set - Store active facilitator IDs
    await client.sAdd('active_facilitators', ['1', '2', '3', '4', '5']);
    
    // Sorted Set - Store module activity scores
    await client.zAdd('module_activity_scores', [
      { score: 95.5, value: 'Advanced Programming' },
      { score: 88.2, value: 'Database Systems' },
      { score: 92.1, value: 'Web Development' },
      { score: 87.8, value: 'Data Structures' }
    ]);
    
    // Retrieve and display the data
    const facilitatorActivity = await client.hGetAll('facilitator:1:activity');
    const recentLogs = await client.lRange('recent_activity_logs', 0, -1);
    const activeFacilitators = await client.sMembers('active_facilitators');
    const topModules = await client.zRange('module_activity_scores', 0, -1, { REV: true });
    
    console.log('✅ Facilitator Activity (Hash):', facilitatorActivity);
    console.log('✅ Recent Activity Logs (List):', recentLogs);
    console.log('✅ Active Facilitators (Set):', activeFacilitators);
    console.log('✅ Top Modules by Activity (Sorted Set):', topModules);
    
    await client.disconnect();
  } catch (error) {
    console.error('❌ Data structures demo failed:', error.message);
  }
}

// 4. Redis Pub/Sub Demo
async function demonstratePubSub() {
  console.log('\n📡 4. Redis Pub/Sub Operations');
  console.log('----------------------------');
  
  const publisher = createRedisClient();
  const subscriber = createRedisClient();
  
  try {
    await publisher.connect();
    await subscriber.connect();
    
    // Subscribe to channels
    await subscriber.subscribe('activity_logs', 'system_alerts', 'facilitator_updates', (message, channel) => {
      console.log(`📨 Received on ${channel}:`, message);
    });
    
    // Publish messages
    await publisher.publish('activity_logs', JSON.stringify({
      type: 'log_submitted',
      facilitatorId: 1,
      moduleId: 5,
      timestamp: new Date().toISOString()
    }));
    
    await publisher.publish('system_alerts', JSON.stringify({
      type: 'deadline_approaching',
      message: 'Weekly activity log deadline in 2 hours',
      timestamp: new Date().toISOString()
    }));
    
    await publisher.publish('facilitator_updates', JSON.stringify({
      type: 'profile_updated',
      facilitatorId: 3,
      changes: ['email', 'phone'],
      timestamp: new Date().toISOString()
    }));
    
    console.log('✅ Messages published to channels');
    
    // Wait a bit for messages to be received
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await publisher.disconnect();
    await subscriber.disconnect();
  } catch (error) {
    console.error('❌ Pub/Sub demo failed:', error.message);
  }
}

// 5. Redis Performance Demo
async function demonstratePerformance() {
  console.log('\n⚡ 5. Redis Performance Operations');
  console.log('----------------------------');
  
  const client = createRedisClient();
  
  try {
    await client.connect();
    
    // Benchmark set operations
    const startTime = Date.now();
    for (let i = 0; i < 1000; i++) {
      await client.set(`benchmark:key:${i}`, `value:${i}`);
    }
    const setTime = Date.now() - startTime;
    
    // Benchmark get operations
    const getStartTime = Date.now();
    for (let i = 0; i < 1000; i++) {
      await client.get(`benchmark:key:${i}`);
    }
    const getTime = Date.now() - getStartTime;
    
    console.log(`✅ Set 1000 keys in ${setTime}ms (${(1000/setTime*1000).toFixed(2)} ops/sec)`);
    console.log(`✅ Get 1000 keys in ${getTime}ms (${(1000/getTime*1000).toFixed(2)} ops/sec)`);
    
    // Clean up benchmark keys
    const keys = await client.keys('benchmark:*');
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`✅ Cleaned up ${keys.length} benchmark keys`);
    }
    
    await client.disconnect();
  } catch (error) {
    console.error('❌ Performance demo failed:', error.message);
  }
}

// 6. Redis Info and Stats
async function showRedisInfo() {
  console.log('\n📊 6. Redis Server Information');
  console.log('----------------------------');
  
  const client = createRedisClient();
  
  try {
    await client.connect();
    
    const info = await client.info();
    const memory = await client.info('memory');
    const stats = await client.info('stats');
    
    console.log('✅ Redis Server Info:');
    console.log('   - Version:', info.split('\n').find(line => line.startsWith('redis_version'))?.split(':')[1]);
    console.log('   - Connected Clients:', stats.split('\n').find(line => line.startsWith('connected_clients'))?.split(':')[1]);
    console.log('   - Used Memory:', memory.split('\n').find(line => line.startsWith('used_memory_human'))?.split(':')[1]);
    console.log('   - Total Commands:', stats.split('\n').find(line => line.startsWith('total_commands_processed'))?.split(':')[1]);
    
    await client.disconnect();
  } catch (error) {
    console.error('❌ Redis info failed:', error.message);
  }
}

// Main demonstration function
async function runRedisDemo() {
  try {
    console.log('🔗 Connecting to Redis at:', `${redisConfig.host}:${redisConfig.port}`);
    
    // Test connection first
    const testClient = createRedisClient();
    await testClient.connect();
    await testClient.ping();
    console.log('✅ Redis connection successful!\n');
    await testClient.disconnect();
    
    // Run all demonstrations
    await demonstrateBasicRedis();
    await demonstrateBullQueues();
    await demonstrateDataStructures();
    await demonstratePubSub();
    await demonstratePerformance();
    await showRedisInfo();
    
    console.log('\n🎉 Redis demonstration completed successfully!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('   • Basic key-value operations');
    console.log('   • Bull queue job management');
    console.log('   • Hash, List, Set, Sorted Set data structures');
    console.log('   • Pub/Sub messaging');
    console.log('   • Performance benchmarking');
    console.log('   • Server information and statistics');
    
  } catch (error) {
    console.error('❌ Redis demonstration failed:', error.message);
    console.log('\n💡 Make sure Redis is running:');
    console.log('   • Install Redis: https://redis.io/download');
    console.log('   • Start Redis: redis-server');
    console.log('   • Or use Docker: docker run -p 6379:6379 redis');
  }
}

// Run the demonstration
if (require.main === module) {
  runRedisDemo();
}

module.exports = {
  runRedisDemo,
  demonstrateBasicRedis,
  demonstrateBullQueues,
  demonstrateDataStructures,
  demonstratePubSub,
  demonstratePerformance,
  showRedisInfo
}; 