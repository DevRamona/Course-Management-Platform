const User = require('./User');
const Module = require('./Module');
const Cohort = require('./Cohort');
const Class = require('./Class');
const Mode = require('./Mode');
const CourseOffering = require('./CourseOffering');

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(CourseOffering, { 
    foreignKey: 'facilitatorId', 
    as: 'facilitatedCourses' 
  });
  CourseOffering.belongsTo(User, { 
    foreignKey: 'facilitatorId', 
    as: 'facilitator' 
  });

  // Module associations
  Module.hasMany(CourseOffering, { 
    foreignKey: 'moduleId', 
    as: 'courseOfferings' 
  });
  CourseOffering.belongsTo(Module, { 
    foreignKey: 'moduleId', 
    as: 'module' 
  });

  // Cohort associations
  Cohort.hasMany(CourseOffering, { 
    foreignKey: 'cohortId', 
    as: 'courseOfferings' 
  });
  CourseOffering.belongsTo(Cohort, { 
    foreignKey: 'cohortId', 
    as: 'cohort' 
  });

  // Class associations
  Class.hasMany(CourseOffering, { 
    foreignKey: 'classId', 
    as: 'courseOfferings' 
  });
  CourseOffering.belongsTo(Class, { 
    foreignKey: 'classId', 
    as: 'class' 
  });

  // Mode associations
  Mode.hasMany(CourseOffering, { 
    foreignKey: 'modeId', 
    as: 'courseOfferings' 
  });
  CourseOffering.belongsTo(Mode, { 
    foreignKey: 'modeId', 
    as: 'mode' 
  });
};

// Initialize associations
defineAssociations();

module.exports = {
  User,
  Module,
  Cohort,
  Class,
  Mode,
  CourseOffering,
  sequelize: require('../config/sequelize')
}; 