const Redis = require('redis');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null
};

async function testRedisConnection() {
  console.log('🔗 Testing Redis Connection...');
  console.log(`📍 Connecting to: ${redisConfig.host}:${redisConfig.port}`);
  
  const client = Redis.createClient(redisConfig);
  
  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
  });
  
  client.on('connect', () => {
    console.log('✅ Redis client connected');
  });
  
  client.on('ready', () => {
    console.log('✅ Redis client ready');
  });
  
  try {
    await client.connect();
    
    // Test basic operations
    console.log('\n🧪 Testing Basic Operations...');
    
    // Set a test key
    await client.set('test:connection', 'Hello Redis!');
    console.log('✅ Set operation successful');
    
    // Get the test key
    const value = await client.get('test:connection');
    console.log('✅ Get operation successful:', value);
    
    // Test queue operations
    console.log('\n🧪 Testing Queue Operations...');
    
    const Bull = require('bull');
    const testQueue = new Bull('test-queue', { redis: redisConfig });
    
    // Add a test job
    const job = await testQueue.add('test-job', { message: 'Hello from Bull!' });
    console.log('✅ Job added to queue:', job.id);
    
    // Get queue stats
    const stats = await testQueue.getJobCounts();
    console.log('✅ Queue stats:', stats);
    
    // Clean up
    await client.del('test:connection');
    await testQueue.clean(0, 'active');
    await testQueue.clean(0, 'wait');
    await testQueue.clean(0, 'completed');
    await testQueue.clean(0, 'failed');
    
    console.log('\n🎉 All Redis tests passed!');
    
    await client.disconnect();
    await testQueue.close();
    
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   • Make sure Redis is installed and running');
    console.log('   • Check if Redis server is on port 6379');
    console.log('   • Try: redis-server');
    console.log('   • Or: docker run -p 6379:6379 redis');
  }
}

if (require.main === module) {
  testRedisConnection();
}

module.exports = { testRedisConnection }; 