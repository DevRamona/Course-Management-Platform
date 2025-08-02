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
    field: 'module_id',
    references: {
      model: 'modules',
      key: 'id'
    }
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'class_id',
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  cohortId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cohort_id',
    references: {
      model: 'cohorts',
      key: 'id'
    }
  },
  facilitatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'facilitator_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  modeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'mode_id',
    references: {
      model: 'modes',
      key: 'id'
    }
  },
  trimester: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  intakePeriod: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'intake_period'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date'
  },
  maxStudents: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_students'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'course_offerings',
  indexes: [
    {
      unique: true,
      name: 'unique_course_offering',
      fields: ['module_id', 'class_id', 'cohort_id', 'trimester', 'intake_period']
    }
  ]
});

module.exports = CourseOffering; 