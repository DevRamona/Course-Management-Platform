const { notificationQueue, reminderQueue, alertQueue } = require('../config/redis');
const { sendActivityLogNotification, sendReminderNotification, sendManagerAlert } = require('../services/notificationService');
const { ActivityTracker, User, sequelize } = require('../models');

console.log('🚀 Starting notification worker...');

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Attempting to use SQLite configuration...');
    
    // Try to use SQLite configuration
    const sqliteConfig = require('../config/database-sqlite');
    const { Sequelize } = require('sequelize');
    
    const sqliteSequelize = new Sequelize(sqliteConfig.development);
    
    try {
      await sqliteSequelize.authenticate();
      console.log('✅ SQLite database connection established successfully');
      // Update the sequelize instance in models
      require('../models').sequelize = sqliteSequelize;
    } catch (sqliteError) {
      console.error('❌ SQLite connection also failed:', sqliteError.message);
      throw new Error('No database connection available');
    }
  }
};

// Initialize database before starting workers
initializeDatabase().then(() => {
  console.log('🔄 Starting scheduled tasks...');
  startScheduledTasks();
}).catch((error) => {
  console.error('❌ Failed to initialize database:', error.message);
  process.exit(1);
});

notificationQueue.process('activity_log_submitted', async (job) => {
  try {
    console.log(`📧 Processing activity log notification for log ID: ${job.data.activityLogId}`);
    const result = await sendActivityLogNotification(job.data.activityLogId);
    
    if (result.success) {
      console.log(`✅ Activity log notification sent successfully`);
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`❌ Activity log notification failed:`, error);
    throw error;
  }
});

reminderQueue.process('weekly_reminder', async (job) => {
  try {
    const { facilitatorId, deadline } = job.data;
    console.log(`📧 Processing reminder for facilitator ID: ${facilitatorId}`);
    
    const result = await sendReminderNotification(facilitatorId, new Date(deadline));
    
    if (result.success) {
      console.log(`✅ Reminder sent successfully to facilitator ${facilitatorId}`);
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`❌ Reminder processing failed:`, error);
    throw error;
  }
});

alertQueue.process('manager_alert', async (job) => {
  try {
    const { managerId, alertType, data } = job.data;
    console.log(`📧 Processing manager alert: ${alertType} for manager ID: ${managerId}`);
    
    const result = await sendManagerAlert(managerId, alertType, data);
    
    if (result.success) {
      console.log(`✅ Manager alert sent successfully`);
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`❌ Manager alert processing failed:`, error);
    throw error;
  }
});

notificationQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed successfully:`, result);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

reminderQueue.on('completed', (job, result) => {
  console.log(`✅ Reminder job ${job.id} completed successfully:`, result);
});

reminderQueue.on('failed', (job, err) => {
  console.error(`❌ Reminder job ${job.id} failed:`, err.message);
});

alertQueue.on('completed', (job, result) => {
  console.log(`✅ Alert job ${job.id} completed successfully:`, result);
});

alertQueue.on('failed', (job, err) => {
  console.error(`❌ Alert job ${job.id} failed:`, err.message);
});

const scheduleWeeklyReminders = async () => {
  try {
    const facilitators = await User.findAll({
      where: { role: 'facilitator', isActive: true }
    });

    const currentDate = new Date();
    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 7);
    deadline.setHours(23, 59, 59, 999);

    for (const facilitator of facilitators) {
      const hasPendingLogs = await ActivityTracker.findOne({
        where: {
          facilitatorId: facilitator.id,
          isActive: true,
          submittedAt: null,
          weekNumber: getWeekNumber(currentDate),
          year: currentDate.getFullYear()
        }
      });

      if (hasPendingLogs) {
        await reminderQueue.add('weekly_reminder', {
          facilitatorId: facilitator.id,
          deadline: deadline.toISOString()
        }, {
          delay: deadline.getTime() - currentDate.getTime()
        });
        console.log(`📅 Scheduled reminder for facilitator ${facilitator.id}`);
      }
    }
  } catch (error) {
    console.error('❌ Error scheduling weekly reminders:', error);
  }
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const checkMissedDeadlines = async () => {
  try {
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();

    const missedDeadlines = await ActivityTracker.findAll({
      where: {
        isActive: true,
        submittedAt: null,
        weekNumber: currentWeek - 1,
        year: currentYear
      },
      include: [
        {
          model: User,
          as: 'facilitator'
        }
      ]
    });

    for (const log of missedDeadlines) {
      const managers = await User.findAll({
        where: { role: 'manager', isActive: true }
      });

      for (const manager of managers) {
        await alertQueue.add('manager_alert', {
          managerId: manager.id,
          alertType: 'missed_deadline',
          data: {
            facilitatorName: `${log.facilitator.firstName} ${log.facilitator.lastName}`,
            facilitatorId: log.facilitatorId,
            weekNumber: log.weekNumber,
            year: log.year,
            deadline: new Date().toISOString()
          }
        });
      }
    }

    console.log(`🔍 Checked for missed deadlines. Found ${missedDeadlines.length} missed submissions.`);
  } catch (error) {
    console.error('❌ Error checking missed deadlines:', error);
  }
};

const startScheduledTasks = () => {
  scheduleWeeklyReminders();
  checkMissedDeadlines();

  setInterval(scheduleWeeklyReminders, 24 * 60 * 60 * 1000);
  setInterval(checkMissedDeadlines, 60 * 60 * 1000);
};

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

console.log('✅ Notification worker started successfully'); 