const User = require('./User');
const Module = require('./Module');
const Cohort = require('./Cohort');
const Class = require('./Class');
const Mode = require('./Mode');
const CourseOffering = require('./CourseOffering');
const ActivityTracker = require('./ActivityTracker');

const defineAssociations = () => {
  User.hasMany(CourseOffering, { 
    foreignKey: 'facilitatorId', 
    as: 'facilitatedCourses' 
  });
  CourseOffering.belongsTo(User, { 
    foreignKey: 'facilitatorId', 
    as: 'facilitator' 
  });

  Module.hasMany(CourseOffering, { 
    foreignKey: 'moduleId', 
    as: 'courseOfferings' 
  });
  CourseOffering.belongsTo(Module, { 
    foreignKey: 'moduleId', 
    as: 'module' 
  });

  Cohort.hasMany(CourseOffering, { 
    foreignKey: 'cohortId', 
    as: 'courseOfferings' 
  });
  CourseOffering.belongsTo(Cohort, { 
    foreignKey: 'cohortId', 
    as: 'cohort' 
  });

  Class.hasMany(CourseOffering, { 
    foreignKey: 'classId', 
    as: 'courseOfferings' 
  });
  CourseOffering.belongsTo(Class, { 
    foreignKey: 'classId', 
    as: 'class' 
  });

  Mode.hasMany(CourseOffering, { 
    foreignKey: 'modeId', 
    as: 'courseOfferings' 
  });
  CourseOffering.belongsTo(Mode, { 
    foreignKey: 'modeId', 
    as: 'mode' 
  });

  CourseOffering.hasMany(ActivityTracker, {
    foreignKey: 'allocationId',
    as: 'activityLogs'
  });
  ActivityTracker.belongsTo(CourseOffering, {
    foreignKey: 'allocationId',
    as: 'courseAllocation'
  });

  User.hasMany(ActivityTracker, {
    foreignKey: 'facilitatorId',
    as: 'activityLogs'
  });
  ActivityTracker.belongsTo(User, {
    foreignKey: 'facilitatorId',
    as: 'facilitator'
  });
};

defineAssociations();

module.exports = {
  User,
  Module,
  Cohort,
  Class,
  Mode,
  CourseOffering,
  ActivityTracker,
  sequelize: require('../config/sequelize')
}; 