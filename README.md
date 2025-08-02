# Course Management Platform

Backend system for academic institutions supporting faculty operations and student progress monitoring.

## Video Link : https://www.youtube.com/watch?v=ghdHLQH_E9w

## Student Pagination Page : https://management-platform1.netlify.app/

## Features

### Course Allocation System
- Role-based access control (Manager, Facilitator)
- Course allocation management with CRUD operations
- Filtering by trimester, cohort, intake, facilitator, and mode
- JWT authentication with input validation

### Facilitator Activity Tracker
- Weekly activity logging for facilitators
- Tracking of attendance, grading, moderation, and sync status
- Redis notification system with automated reminders
- Background workers for processing notifications
- Email notifications for facilitators and managers

### Student Reflection Page
- Internationalization (i18n) support
- Student progress tracking
- Reflection and feedback system

## Tech Stack

- Backend: Node.js, Express.js
- Database: MySQL with Sequelize ORM
- Authentication: JWT with bcrypt
- Queue System: Redis with Bull
- Email: Nodemailer
- Validation: express-validator
- Security: Helmet, CORS, Rate Limiting
- Testing: Jest, Supertest
- Logging: Winston

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Redis (v6.0 or higher) - for Module 2 notifications

##  Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd course-management-platform
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=course_management
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=4000
NODE_ENV=development

# Redis Configuration (for Module 2)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (for Module 2)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@university.edu
```

### 3. Database Setup
```bash
mysql -u root -p -e "CREATE DATABASE course_management_db;"

npm run db:reset
```

### 4. Start Services
```bash
redis-server

npm run dev

npm run worker
```

##  Database Schema

### Core Models
- **User**: Managers, Facilitators, Students
- **Module**: Course definitions
- **Cohort**: Student groups
- **Class**: Academic periods
- **Mode**: Delivery methods (Online, In-person, Hybrid)
- **CourseOffering**: Course allocations
- **ActivityTracker**: Weekly facilitator activity logs

### Module 2: ActivityTracker Schema
```sql
CREATE TABLE activity_trackers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  allocation_id INT NOT NULL,
  facilitator_id INT NOT NULL,
  week_number INT NOT NULL,
  year INT NOT NULL,
  attendance JSON,
  formative_one_grading ENUM('Done', 'Pending', 'Not Started'),
  formative_two_grading ENUM('Done', 'Pending', 'Not Started'),
  summative_grading ENUM('Done', 'Pending', 'Not Started'),
  course_moderation ENUM('Done', 'Pending', 'Not Started'),
  intranet_sync ENUM('Done', 'Pending', 'Not Started'),
  grade_book_status ENUM('Done', 'Pending', 'Not Started'),
  notes TEXT,
  submitted_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_activity_tracker (allocation_id, week_number, year)
);
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@university.edu | Password123! |
| Facilitator 1 | facilitator1@university.edu | Password123! |
| Facilitator 2 | facilitator2@university.edu | Password123! |
| Student | student@university.edu | Password123! |

## 📡 API Documentation

### Swagger UI
The API documentation is available via Swagger UI at:
```
http://localhost:3001/api-docs
```

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
```

### Module 1: Course Allocations
```http
GET /api/course-offerings
POST /api/course-offerings
GET /api/course-offerings/:id
PUT /api/course-offerings/:id
DELETE /api/course-offerings/:id
GET /api/course-offerings/facilitator/my-courses
```

### Module 2: Activity Tracker
```http
# Manager endpoints (view all logs)
GET /api/activity-tracker
GET /api/activity-tracker/:id
GET /api/activity-tracker/allocation/:allocationId

# Facilitator endpoints (manage own logs)
GET /api/activity-tracker/facilitator/my-logs
POST /api/activity-tracker
PUT /api/activity-tracker/:id
DELETE /api/activity-tracker/:id
```

### Activity Log Request Body
```json
{
  "allocationId": 1,
  "weekNumber": 1,
  "year": 2024,
  "attendance": [true, true, true, true, true],
  "formativeOneGrading": "Done",
  "formativeTwoGrading": "Not Started",
  "summativeGrading": "Not Started",
  "courseModeration": "Pending",
  "intranetSync": "Done",
  "gradeBookStatus": "Done",
  "notes": "Week 1 completed successfully"
}
```

##  Notification System (Module 2)

### Features
- **Automated reminders** to facilitators for pending logs
- **Manager alerts** for missed deadlines and late submissions
- **Email notifications** with detailed activity summaries
- **Redis-backed queue system** for reliable delivery
- **Background workers** for processing notifications

### Notification Types
1. **Activity Log Submitted**: Sent to facilitators when logs are submitted
2. **Weekly Reminders**: Automated reminders for pending submissions
3. **Manager Alerts**: Alerts for missed deadlines and compliance issues

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/activityTracker.test.js
```

##  Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run test suite
npm run test:watch # Run tests in watch mode
npm run db:migrate # Run database migrations
npm run db:seed    # Seed database with sample data
npm run db:reset   # Reset database (drop, create, migrate, seed)
npm run worker     # Start notification worker
```

##  Security Features

- **JWT Authentication** with secure token management
- **Password hashing** using bcrypt
- **Input validation** with express-validator
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Helmet** for security headers
- **SQL injection prevention** with Sequelize ORM
- **Role-based access control** (RBAC)

## Project Structure

```
course-management-platform/
├── config/
│   ├── database.js          # Database configuration
│   ├── sequelize.js         # Sequelize ORM setup
│   └── redis.js            # Redis configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── courseOfferingController.js
│   └── activityTrackerController.js
├── middleware/
│   ├── auth.js             # JWT authentication
│   └── validation.js       # Input validation
├── models/
│   ├── User.js
│   ├── Module.js
│   ├── Cohort.js
│   ├── Class.js
│   ├── Mode.js
│   ├── CourseOffering.js
│   ├── ActivityTracker.js
│   └── index.js
├── routes/
│   ├── auth.js
│   ├── courseOfferings.js
│   └── activityTracker.js
├── services/
│   └── notificationService.js
├── workers/
│   └── notificationWorker.js
├── seeders/
│   └── seedData.js
├── tests/
│   ├── auth.test.js
│   └── activityTracker.test.js
├── scripts/
│   └── test-connection.js
├── server.js
├── package.json
└── README.md
```

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=4000
DB_HOST=your_production_db_host
DB_USERNAME=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=your_production_db_name
JWT_SECRET=your_production_jwt_secret
REDIS_HOST=your_production_redis_host
SMTP_USER=your_production_email
SMTP_PASS=your_production_email_password
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation above
- Review the test files for usage examples

---

**Status**: Module 1 ✅ Complete | Module 2 ✅ Complete | Module 3 🔄 In Progress