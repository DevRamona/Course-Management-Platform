const { CourseOffering, User, Module, Cohort, Class, Mode } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new course offering (Managers only)
 */
const createCourseOffering = async (req, res) => {
  try {
    const {
      moduleId,
      classId,
      cohortId,
      facilitatorId,
      modeId,
      trimester,
      intakePeriod,
      startDate,
      endDate,
      maxStudents
    } = req.body;

    // Check if facilitator exists and is a facilitator
    const facilitator = await User.findOne({
      where: { id: facilitatorId, role: 'facilitator' }
    });

    if (!facilitator) {
      return res.status(400).json({
        success: false,
        message: 'Facilitator not found or invalid'
      });
    }

    // Check for duplicate course offering
    const existingOffering = await CourseOffering.findOne({
      where: {
        moduleId,
        classId,
        cohortId,
        trimester,
        intakePeriod
      }
    });

    if (existingOffering) {
      return res.status(400).json({
        success: false,
        message: 'Course offering already exists for this combination'
      });
    }

    const courseOffering = await CourseOffering.create({
      moduleId,
      classId,
      cohortId,
      facilitatorId,
      modeId,
      trimester,
      intakePeriod,
      startDate,
      endDate,
      maxStudents
    });

    // Fetch the created offering with associations
    const createdOffering = await CourseOffering.findByPk(courseOffering.id, {
      include: [
        { model: Module, as: 'module' },
        { model: Class, as: 'class' },
        { model: Cohort, as: 'cohort' },
        { model: User, as: 'facilitator' },
        { model: Mode, as: 'mode' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Course offering created successfully',
      data: { courseOffering: createdOffering }
    });
  } catch (error) {
    console.error('Create course offering error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all course offerings with filtering
 */
const getCourseOfferings = async (req, res) => {
  try {
    const {
      trimester,
      intakePeriod,
      facilitatorId,
      modeId,
      cohortId,
      moduleId,
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause for filtering
    const whereClause = { isActive: true };
    
    if (trimester) whereClause.trimester = trimester;
    if (intakePeriod) whereClause.intakePeriod = intakePeriod;
    if (facilitatorId) whereClause.facilitatorId = facilitatorId;
    if (modeId) whereClause.modeId = modeId;
    if (cohortId) whereClause.cohortId = cohortId;
    if (moduleId) whereClause.moduleId = moduleId;

    // Pagination
    const offset = (page - 1) * limit;

    const { count, rows: courseOfferings } = await CourseOffering.findAndCountAll({
      where: whereClause,
      include: [
        { model: Module, as: 'module' },
        { model: Class, as: 'class' },
        { model: Cohort, as: 'cohort' },
        { model: User, as: 'facilitator' },
        { model: Mode, as: 'mode' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        courseOfferings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get course offerings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get course offering by ID
 */
const getCourseOfferingById = async (req, res) => {
  try {
    const { id } = req.params;

    const courseOffering = await CourseOffering.findByPk(id, {
      include: [
        { model: Module, as: 'module' },
        { model: Class, as: 'class' },
        { model: Cohort, as: 'cohort' },
        { model: User, as: 'facilitator' },
        { model: Mode, as: 'mode' }
      ]
    });

    if (!courseOffering) {
      return res.status(404).json({
        success: false,
        message: 'Course offering not found'
      });
    }

    res.json({
      success: true,
      data: { courseOffering }
    });
  } catch (error) {
    console.error('Get course offering error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update course offering (Managers only)
 */
const updateCourseOffering = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const courseOffering = await CourseOffering.findByPk(id);
    if (!courseOffering) {
      return res.status(404).json({
        success: false,
        message: 'Course offering not found'
      });
    }

    // If facilitator is being updated, verify they exist and are a facilitator
    if (updateData.facilitatorId) {
      const facilitator = await User.findOne({
        where: { id: updateData.facilitatorId, role: 'facilitator' }
      });

      if (!facilitator) {
        return res.status(400).json({
          success: false,
          message: 'Facilitator not found or invalid'
        });
      }
    }

    await courseOffering.update(updateData);

    // Fetch updated offering with associations
    const updatedOffering = await CourseOffering.findByPk(id, {
      include: [
        { model: Module, as: 'module' },
        { model: Class, as: 'class' },
        { model: Cohort, as: 'cohort' },
        { model: User, as: 'facilitator' },
        { model: Mode, as: 'mode' }
      ]
    });

    res.json({
      success: true,
      message: 'Course offering updated successfully',
      data: { courseOffering: updatedOffering }
    });
  } catch (error) {
    console.error('Update course offering error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete course offering (Managers only)
 */
const deleteCourseOffering = async (req, res) => {
  try {
    const { id } = req.params;

    const courseOffering = await CourseOffering.findByPk(id);
    if (!courseOffering) {
      return res.status(404).json({
        success: false,
        message: 'Course offering not found'
      });
    }

    // Soft delete by setting isActive to false
    await courseOffering.update({ isActive: false });

    res.json({
      success: true,
      message: 'Course offering deleted successfully'
    });
  } catch (error) {
    console.error('Delete course offering error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get course offerings for a specific facilitator
 */
const getFacilitatorCourseOfferings = async (req, res) => {
  try {
    const facilitatorId = req.user.id;
    const { trimester, intakePeriod } = req.query;

    const whereClause = {
      facilitatorId,
      isActive: true
    };

    if (trimester) whereClause.trimester = trimester;
    if (intakePeriod) whereClause.intakePeriod = intakePeriod;

    const courseOfferings = await CourseOffering.findAll({
      where: whereClause,
      include: [
        { model: Module, as: 'module' },
        { model: Class, as: 'class' },
        { model: Cohort, as: 'cohort' },
        { model: Mode, as: 'mode' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { courseOfferings }
    });
  } catch (error) {
    console.error('Get facilitator course offerings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createCourseOffering,
  getCourseOfferings,
  getCourseOfferingById,
  updateCourseOffering,
  deleteCourseOffering,
  getFacilitatorCourseOfferings
}; 