const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const StudentReflection = sequelize.define('StudentReflection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    courseOfferingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'course_offerings',
            key: 'id'
        }
    },
    question1: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'What did you enjoy most about the course?'
    },
    question2: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'What was the most challenging part?'
    },
    question3: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'What could be improved?'
    },
    language: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'en',
        comment: 'Language used for reflection (en, fr, es)'
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'student_reflections',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'course_offering_id']
        },
        {
            fields: ['student_id']
        },
        {
            fields: ['course_offering_id']
        },
        {
            fields: ['submitted_at']
        }
    ]
});

module.exports = StudentReflection; 