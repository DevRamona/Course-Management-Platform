const { StudentReflection, User, CourseOffering, Module, sequelize } = require('../models');
const { validationResult } = require('express-validator');

const createReflection = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { courseOfferingId, question1, question2, question3, language = 'en' } = req.body;
        const studentId = req.user.id;

        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Only students can create reflections'
            });
        }

        const courseOffering = await CourseOffering.findByPk(courseOfferingId);
        if (!courseOffering) {
            return res.status(404).json({
                success: false,
                message: 'Course offering not found'
            });
        }

        const existingReflection = await StudentReflection.findOne({
            where: { studentId, courseOfferingId }
        });

        if (existingReflection) {
            return res.status(409).json({
                success: false,
                message: 'Reflection already exists for this course offering'
            });
        }

        const reflection = await StudentReflection.create({
            studentId,
            courseOfferingId,
            question1,
            question2,
            question3,
            language,
            submittedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Reflection created successfully',
            data: reflection
        });

    } catch (error) {
        console.error('Error creating reflection:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getReflection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const reflection = await StudentReflection.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'student',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: CourseOffering,
                    as: 'courseOffering',
                    include: [
                        {
                            model: Module,
                            as: 'module',
                            attributes: ['code', 'name']
                        }
                    ]
                }
            ]
        });

        if (!reflection) {
            return res.status(404).json({
                success: false,
                message: 'Reflection not found'
            });
        }

        if (req.user.role === 'student' && reflection.studentId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: reflection
        });

    } catch (error) {
        console.error('Error fetching reflection:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const updateReflection = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { question1, question2, question3, language } = req.body;
        const userId = req.user.id;

        const reflection = await StudentReflection.findByPk(id);

        if (!reflection) {
            return res.status(404).json({
                success: false,
                message: 'Reflection not found'
            });
        }

        if (req.user.role === 'student' && reflection.studentId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await reflection.update({
            question1,
            question2,
            question3,
            language,
            updatedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Reflection updated successfully',
            data: reflection
        });

    } catch (error) {
        console.error('Error updating reflection:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const deleteReflection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const reflection = await StudentReflection.findByPk(id);

        if (!reflection) {
            return res.status(404).json({
                success: false,
                message: 'Reflection not found'
            });
        }

        if (req.user.role === 'student' && reflection.studentId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await reflection.destroy();

        res.json({
            success: true,
            message: 'Reflection deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting reflection:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getStudentReflections = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, courseOfferingId } = req.query;

        const whereClause = {};
        if (req.user.role === 'student') {
            whereClause.studentId = userId;
        }
        if (courseOfferingId) {
            whereClause.courseOfferingId = courseOfferingId;
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await StudentReflection.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'student',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: CourseOffering,
                    as: 'courseOffering',
                    include: [
                        {
                            model: Module,
                            as: 'module',
                            attributes: ['code', 'name']
                        }
                    ]
                }
            ],
            order: [['submittedAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching reflections:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getReflectionStats = async (req, res) => {
    try {
        if (req.user.role !== 'manager' && req.user.role !== 'facilitator') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const stats = await StudentReflection.findAll({
            attributes: [
                'language',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['language'],
            raw: true
        });

        const totalReflections = await StudentReflection.count();
        const recentReflections = await StudentReflection.count({
            where: {
                submittedAt: {
                    [sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        res.json({
            success: true,
            data: {
                languageStats: stats,
                totalReflections,
                recentReflections
            }
        });

    } catch (error) {
        console.error('Error fetching reflection stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createReflection,
    getReflection,
    updateReflection,
    deleteReflection,
    getStudentReflections,
    getReflectionStats
}; 