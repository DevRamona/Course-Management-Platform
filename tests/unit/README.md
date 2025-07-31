# Unit Tests

This directory contains comprehensive unit tests for the Course Management Platform application.

## Structure

```
tests/unit/
├── controllers/
│   ├── authController.test.js
│   └── activityTrackerController.test.js
├── middleware/
│   ├── auth.test.js
│   └── validation.test.js
├── models/
│   └── User.test.js
├── utils/
│   └── auth.test.js
└── README.md
```

## Test Categories

### Controllers
- **authController.test.js**: Tests for user registration, login, and profile management
- **activityTrackerController.test.js**: Tests for activity log CRUD operations

### Middleware
- **auth.test.js**: Tests for JWT authentication and role-based access control
- **validation.test.js**: Tests for request validation middleware

### Models
- **User.test.js**: Tests for User model methods, validation, and hooks

### Utils
- **auth.test.js**: Tests for authentication utility functions

## Running Tests

### Run All Unit Tests
```bash
npm run test:unit
```

### Run Specific Test File
```bash
npm test -- tests/unit/controllers/authController.test.js
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch -- --testPathPattern=tests/unit
```

## Test Features

### Mocking Strategy
- **Dependencies**: All external dependencies are mocked using Jest
- **Database**: Sequelize models are mocked to avoid database connections
- **External Services**: Notification services and other external APIs are mocked

### Test Coverage
- **Happy Path**: Tests for successful operations
- **Error Handling**: Tests for various error scenarios
- **Edge Cases**: Tests for boundary conditions and invalid inputs
- **Authentication**: Tests for JWT token validation and role-based access
- **Validation**: Tests for input validation and sanitization

### Test Patterns
- **Arrange-Act-Assert**: Clear test structure with setup, execution, and verification
- **Isolation**: Each test is independent and doesn't rely on other tests
- **Descriptive Names**: Test names clearly describe what is being tested
- **Comprehensive Assertions**: Multiple assertions to verify complete behavior

## Key Testing Principles

### 1. Isolation
- Each test runs in isolation
- Dependencies are mocked to prevent external side effects
- No shared state between tests

### 2. Completeness
- Tests cover all major functions and edge cases
- Error scenarios are thoroughly tested
- Input validation is verified

### 3. Maintainability
- Tests are well-organized and documented
- Mock setup is consistent across test files
- Test data is realistic and representative

### 4. Performance
- Tests run quickly without external dependencies
- No database connections or network calls
- Efficient mocking strategy

## Mock Examples

### Controller Testing
```javascript
// Mock request and response objects
const mockReq = {
  body: {},
  user: { id: 1, role: 'facilitator' }
};
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
};
```

### Model Testing
```javascript
// Mock Sequelize model methods
User.findOne.mockResolvedValue(mockUser);
User.create.mockResolvedValue(newUser);
```

### Middleware Testing
```javascript
// Mock JWT verification
jwt.verify.mockReturnValue(decodedToken);
```

## Best Practices

1. **Clear Test Names**: Use descriptive names that explain what is being tested
2. **Setup and Teardown**: Use `beforeEach` and `afterEach` for consistent test setup
3. **Mock Reset**: Clear mocks between tests to prevent interference
4. **Error Testing**: Test both success and failure scenarios
5. **Edge Cases**: Test boundary conditions and invalid inputs
6. **Documentation**: Add comments for complex test scenarios

## Coverage Goals

- **Controllers**: 90%+ coverage
- **Middleware**: 95%+ coverage  
- **Models**: 85%+ coverage
- **Utils**: 95%+ coverage

## Continuous Integration

Unit tests are designed to run quickly in CI/CD pipelines:
- No external dependencies
- Fast execution time
- Reliable results
- Comprehensive coverage reporting 