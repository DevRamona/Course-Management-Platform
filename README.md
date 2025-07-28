# Course Management Platform

A comprehensive backend system for academic institutions to manage course allocations, facilitator assignments, and student progress tracking. Built with Node.js, Express, MySQL, and Sequelize ORM.

## 🚀 Features

### Module 1: Course Allocation System ✅
- **Role-based Access Control**: Managers can assign facilitators to courses, facilitators can view their assignments
- **CRUD Operations**: Complete Create, Read, Update, Delete operations for course offerings
- **Advanced Filtering**: Filter course offerings by trimester, cohort, intake period, facilitator, and mode
- **Secure Authentication**: JWT-based authentication with role-based permissions
- **Data Validation**: Comprehensive input validation and error handling

### Planned Modules
- **Module 2**: Facilitator Activity Tracker (FAT)
- **Module 3**: Student Reflection Page with i18n/l10n

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, Supertest

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Course-Management-Platform
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=course_management_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE course_management_db;
```

2. Run the application to sync models:
```bash
npm start
```

### 4. Seed Initial Data

```bash
node -e "require('./seeders/seedData').seedData().then(() => process.exit())"
```

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 🔑 Test Accounts

After seeding data, you can use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@university.edu | Password123! |
| Facilitator 1 | facilitator1@university.edu | Password123! |
| Facilitator 2 | facilitator2@university.edu | Password123! |
| Student | student@university.edu | Password123! |

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "facilitator"
}
```

#### POST `/api/auth/login`
Login user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication).

### Course Offering Endpoints

#### GET `/api/course-offerings`
Get all course offerings with optional filtering.

**Query Parameters:**
- `trimester`: HT1, HT2, FT
- `intakePeriod`: HT1, HT2, FT
- `facilitatorId`: Facilitator ID
- `modeId`: Mode ID
- `cohortId`: Cohort ID
- `moduleId`: Module ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### GET `/api/course-offerings/:id`
Get specific course offering by ID.

#### POST `/api/course-offerings` (Managers only)
Create a new course offering.

**Request Body:**
```json
{
  "moduleId": 1,
  "classId": 1,
  "cohortId": 1,
  "facilitatorId": 2,
  "modeId": 2,
  "trimester": "HT1",
  "intakePeriod": "HT1",
  "startDate": "2024-01-15",
  "endDate": "2024-05-15",
  "maxStudents": 30
}
```

#### PUT `/api/course-offerings/:id` (Managers only)
Update a course offering.

#### DELETE `/api/course-offerings/:id` (Managers only)
Delete a course offering (soft delete).

#### GET `/api/course-offerings/facilitator/my-courses` (Facilitators only)
Get course offerings assigned to the authenticated facilitator.

## 🗄️ Database Schema

### Core Models

#### User
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `firstName`
- `lastName`
- `role` (manager, facilitator, student)
- `isActive`
- `lastLogin`

#### Module
- `id` (Primary Key)
- `code` (Unique)
- `name`
- `description`
- `credits`
- `isActive`

#### CourseOffering
- `id` (Primary Key)
- `moduleId` (Foreign Key)
- `classId` (Foreign Key)
- `cohortId` (Foreign Key)
- `facilitatorId` (Foreign Key)
- `modeId` (Foreign Key)
- `trimester` (HT1, HT2, FT)
- `intakePeriod` (HT1, HT2, FT)
- `startDate`
- `endDate`
- `maxStudents`
- `isActive`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for managers, facilitators, and students
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: HTTP headers security
- **SQL Injection Prevention**: Parameterized queries via Sequelize

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Available Scripts

```bash
# Start the server
npm start

# Start in development mode with auto-restart
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Reset database (drop, create, migrate, seed)
npm run db:reset
```

## 🏗️ Project Structure

```
Course-Management-Platform/
├── config/
│   ├── database.js          # Database configuration
│   └── sequelize.js         # Sequelize setup
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── courseOfferingController.js # Course offering CRUD
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── validation.js        # Input validation middleware
├── models/
│   ├── User.js              # User model
│   ├── Module.js            # Module/Course model
│   ├── Cohort.js            # Cohort model
│   ├── Class.js             # Class model
│   ├── Mode.js              # Delivery mode model
│   ├── CourseOffering.js    # Course offering model
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js              # Authentication routes
│   └── courseOfferings.js   # Course offering routes
├── seeders/
│   └── seedData.js          # Initial data seeding
├── utils/
│   └── auth.js              # Authentication utilities
├── server.js                # Main application file
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Note**: This is Module 1 of the Course Management Platform. Additional modules for Facilitator Activity Tracker and Student Reflection Page will be implemented in future iterations.