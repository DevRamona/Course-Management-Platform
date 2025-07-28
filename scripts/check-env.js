require('dotenv').config();

console.log('🔍 Checking Environment Variables...');
console.log('=' .repeat(50));

console.log('Database Configuration:');
console.log(`DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
console.log(`DB_PORT: ${process.env.DB_PORT || 'NOT SET'}`);
console.log(`DB_USERNAME: ${process.env.DB_USERNAME || 'NOT SET'}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD === '' ? '(empty string)' : process.env.DB_PASSWORD || 'NOT SET'}`);
console.log(`DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
console.log(`DB_DIALECT: ${process.env.DB_DIALECT || 'NOT SET'}`);

console.log('\nServer Configuration:');
console.log(`PORT: ${process.env.PORT || 'NOT SET'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);

console.log('\nJWT Configuration:');
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
console.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || 'NOT SET'}`);

console.log('\nRedis Configuration:');
console.log(`REDIS_HOST: ${process.env.REDIS_HOST || 'NOT SET'}`);
console.log(`REDIS_PORT: ${process.env.REDIS_PORT || 'NOT SET'}`);

console.log('\nEmail Configuration:');
console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
console.log(`SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);

console.log('\n' + '=' .repeat(50)); 