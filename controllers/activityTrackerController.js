const { ActivityTracker, CourseOffering, User, Module, Cohort, Class, Mode } = require('../models');
const { Op } = require('sequelize');
const { createNotification, createAlert } = require('../services/notificationService');

const createActivityLog = async (req, res) => {
  try {
    const facilitatorId = req.user.id;
    const {
      allocationId,
      weekNumber,
      year,
      attendance,
      formativeOneGrading,
      formativeTwoGrading,
      summativeGrading,
      courseModeration,
      intranetSync,
      gradeBookStatus,
      notes
    } = req.body;

    const courseAllocation = await CourseOffering.findOne({
      where: { id: allocationId, facilitatorId, isActive: true }
    });

    if (!courseAllocation) {
      return res.status(404).json({
        success: false,
        message: 'Course allocation not found or not assigned to you'
      });
    }

    const existingLog = await ActivityTracker.findOne({
      where: {
        allocationId,
        weekNumber,
        year,
        isActive: true
      }
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
        message: 'Activity log already exists for this week and allocation'
      });
    }

    const activityLog = await ActivityTracker.create({
      allocationId,
      facilitatorId,
      weekNumber,
      year,
      attendance: attendance || [],
      formativeOneGrading,
      formativeTwoGrading,
      summativeGrading,
      courseModeration,
      intranetSync,
      gradeBookStatus,
      notes,
      submittedAt: new Date()
    });

    const createdLog = await ActivityTracker.findByPk(activityLog.id, {
      include: [
        {
          model: CourseOffering,
          as: 'courseAllocation',
          include: [
            { model: Module, as: 'module' },
            { model: Class, as: 'class' },
            { model: Cohort, as: 'cohort' },
            { model: Mode, as: 'mode' }
          ]
        }
      ]
    });

    await createNotification('activity_log_submitted', {
      activityLogId: activityLog.id,
      facilitatorId,
      allocationId,
      weekNumber,
      year
    });

    const managers = await User.findAll({
      where: { role: 'manager', isActive: true }
    });

    for (const manager of managers) {
      await createAlert(manager.id, 'activity_log_submitted', {
        facilitatorName: `${req.user.firstName} ${req.user.lastName}`,
        moduleName: createdLog.courseAllocation.module.name,
        weekNumber,
        year,
        submittedAt: activityLog.submittedAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Activity log created successfully',
      data: { activityLog: createdLog }
    });
  } catch (error) {
    console.error('Create activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const {
      facilitatorId,
      allocationId,
      weekNumber,
      year,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const whereClause = { isActive: true };
    
    if (facilitatorId) whereClause.facilitatorId = facilitatorId;
    if (allocationId) whereClause.allocationId = allocationId;
    if (weekNumber) whereClause.weekNumber = weekNumber;
    if (year) whereClause.year = year;

    const offset = (page - 1) * limit;

    const { count, rows: activityLogs } = await ActivityTracker.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CourseOffering,
          as: 'courseAllocation',
          include: [
            { model: Module, as: 'module' },
            { model: Class, as: 'class' },
            { model: Cohort, as: 'cohort' },
            { model: User, as: 'facilitator' },
            { model: Mode, as: 'mode' }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    let filteredLogs = activityLogs;

    if (status) {
      filteredLogs = activityLogs.filter(log => {
        const statuses = [
          log.formativeOneGrading,
          log.formativeTwoGrading,
          log.summativeGrading,
          log.courseModeration,
          log.intranetSync,
          log.gradeBookStatus
        ];
        return statuses.includes(status);
      });
    }

    res.json({
      success: true,
      data: {
        activityLogs: filteredLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const activityLog = await ActivityTracker.findByPk(id, {
      include: [
        {
          model: CourseOffering,
          as: 'courseAllocation',
          include: [
            { model: Module, as: 'module' },
            { model: Class, as: 'class' },
            { model: Cohort, as: 'cohort' },
            { model: User, as: 'facilitator' },
            { model: Mode, as: 'mode' }
          ]
        }
      ]
    });

    if (!activityLog) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found'
      });
    }

    res.json({
      success: true,
      data: { activityLog }
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    const facilitatorId = req.user.id;
    const updateData = req.body;

    const activityLog = await ActivityTracker.findByPk(id);
    if (!activityLog) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found'
      });
    }

    if (activityLog.facilitatorId !== facilitatorId && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own activity logs'
      });
    }

    const wasSubmitted = activityLog.submittedAt !== null;
    const isNowSubmitted = updateData.submittedAt !== undefined;

    await activityLog.update({
      ...updateData,
      submittedAt: new Date()
    });

    const updatedLog = await ActivityTracker.findByPk(id, {
      include: [
        {
          model: CourseOffering,
          as: 'courseAllocation',
          include: [
            { model: Module, as: 'module' },
            { model: Class, as: 'class' },
            { model: Cohort, as: 'cohort' },
            { model: User, as: 'facilitator' },
            { model: Mode, as: 'mode' }
          ]
        }
      ]
    });

    if (!wasSubmitted && isNowSubmitted) {
      await createNotification('activity_log_submitted', {
        activityLogId: activityLog.id,
        facilitatorId,
        allocationId: activityLog.allocationId,
        weekNumber: activityLog.weekNumber,
        year: activityLog.year
      });
    }

    res.json({
      success: true,
      message: 'Activity log updated successfully',
      data: { activityLog: updatedLog }
    });
  } catch (error) {
    console.error('Update activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    const facilitatorId = req.user.id;

    const activityLog = await ActivityTracker.findByPk(id);
    if (!activityLog) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found'
      });
    }

    if (activityLog.facilitatorId !== facilitatorId && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own activity logs'
      });
    }

    await activityLog.update({ isActive: false });

    res.json({
      success: true,
      message: 'Activity log deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getFacilitatorActivityLogs = async (req, res) => {
  try {
    const facilitatorId = req.user.id;
    const { weekNumber, year, allocationId } = req.query;

    const whereClause = {
      facilitatorId,
      isActive: true
    };

    if (weekNumber) whereClause.weekNumber = weekNumber;
    if (year) whereClause.year = year;
    if (allocationId) whereClause.allocationId = allocationId;

    const activityLogs = await ActivityTracker.findAll({
      where: whereClause,
      include: [
        {
          model: CourseOffering,
          as: 'courseAllocation',
          include: [
            { model: Module, as: 'module' },
            { model: Class, as: 'class' },
            { model: Cohort, as: 'cohort' },
            { model: Mode, as: 'mode' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { activityLogs }
    });
  } catch (error) {
    console.error('Get facilitator activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getActivityLogsByAllocation = async (req, res) => {
  try {
    const { allocationId } = req.params;
    const { weekNumber, year, status } = req.query;

    const whereClause = {
      allocationId,
      isActive: true
    };

    if (weekNumber) whereClause.weekNumber = weekNumber;
    if (year) whereClause.year = year;

    const activityLogs = await ActivityTracker.findAll({
      where: whereClause,
      include: [
        {
          model: CourseOffering,
          as: 'courseAllocation',
          include: [
            { model: Module, as: 'module' },
            { model: Class, as: 'class' },
            { model: Cohort, as: 'cohort' },
            { model: User, as: 'facilitator' },
            { model: Mode, as: 'mode' }
          ]
        }
      ],
      order: [['weekNumber', 'ASC'], ['year', 'ASC']]
    });

    let filteredLogs = activityLogs;

    if (status) {
      filteredLogs = activityLogs.filter(log => {
        const statuses = [
          log.formativeOneGrading,
          log.formativeTwoGrading,
          log.summativeGrading,
          log.courseModeration,
          log.intranetSync,
          log.gradeBookStatus
        ];
        return statuses.includes(status);
      });
    }

    res.json({
      success: true,
      data: { activityLogs: filteredLogs }
    });
  } catch (error) {
    console.error('Get activity logs by allocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createActivityLog,
  getActivityLogs,
  getActivityLogById,
  updateActivityLog,
  deleteActivityLog,
  getFacilitatorActivityLogs,
  getActivityLogsByAllocation
}; 