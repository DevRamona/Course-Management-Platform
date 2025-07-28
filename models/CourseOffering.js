const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const CourseOffering = sequelize.define('CourseOffering', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  moduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modules',
      key: 'id'
    }
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  cohortId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cohorts',
      key: 'id'
    }
  },
  facilitatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  modeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modes',
      key: 'id'
    }
  },
  trimester: {
    type: DataTypes.ENUM('HT1', 'HT2', 'FT'),
    allowNull: false
  },
  intakePeriod: {
    type: DataTypes.ENUM('HT1', 'HT2', 'FT'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  maxStudents: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'course_offerings',
  indexes: [
    {
      unique: true,
      fields: ['moduleId', 'classId', 'cohortId', 'trimester', 'intakePeriod']
    }
  ]
});

module.exports = CourseOffering; 