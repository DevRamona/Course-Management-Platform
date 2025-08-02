const nodemailer = require('nodemailer');
const { notificationQueue, reminderQueue, alertQueue } = require('../config/redis');
const { ActivityTracker, User, CourseOffering, Module } = require('../models');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@university.edu',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

const createNotification = async (type, data) => {
  try {
    await notificationQueue.add(type, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    console.log(`✅ Notification queued: ${type}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Notification queuing failed:', error);
    return { success: false, error: error.message };
  }
};

const createReminder = async (facilitatorId, deadline) => {
  try {
    const facilitator = await User.findByPk(facilitatorId);
    if (!facilitator) {
      throw new Error('Facilitator not found');
    }

    const reminderData = {
      facilitatorId,
      facilitatorEmail: facilitator.email,
      facilitatorName: `${facilitator.firstName} ${facilitator.lastName}`,
      deadline,
      type: 'weekly_activity_reminder'
    };

    await reminderQueue.add('weekly_reminder', reminderData, {
      delay: deadline.getTime() - Date.now(),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    console.log(`✅ Reminder scheduled for facilitator ${facilitatorId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Reminder scheduling failed:', error);
    return { success: false, error: error.message };
  }
};

const createAlert = async (managerId, alertType, data) => {
  try {
    const manager = await User.findByPk(managerId);
    if (!manager) {
      throw new Error('Manager not found');
    }

    const alertData = {
      managerId,
      managerEmail: manager.email,
      managerName: `${manager.firstName} ${manager.lastName}`,
      alertType,
      data,
      timestamp: new Date()
    };

    await alertQueue.add('manager_alert', alertData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    console.log(`✅ Alert queued for manager ${managerId}: ${alertType}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Alert queuing failed:', error);
    return { success: false, error: error.message };
  }
};

const sendActivityLogNotification = async (activityLogId) => {
  try {
    // Ensure database connection is available
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    
    const activityLog = await ActivityTracker.findByPk(activityLogId, {
      include: [
        {
          model: CourseOffering,
          as: 'courseAllocation',
          include: [
            { model: User, as: 'facilitator' },
            { model: Module, as: 'module' }
          ]
        }
      ]
    });

    if (!activityLog) {
      throw new Error('Activity log not found');
    }

    const facilitator = activityLog.courseAllocation.facilitator;
    const module = activityLog.courseAllocation.module;

    const emailHtml = `
      <h2>Activity Log Submitted</h2>
      <p><strong>Facilitator:</strong> ${facilitator.firstName} ${facilitator.lastName}</p>
      <p><strong>Module:</strong> ${module.name} (${module.code})</p>
      <p><strong>Week:</strong> ${activityLog.weekNumber}, ${activityLog.year}</p>
      <p><strong>Submitted:</strong> ${activityLog.submittedAt}</p>
      <hr>
      <h3>Activity Status:</h3>
      <ul>
        <li>Formative One Grading: ${activityLog.formativeOneGrading}</li>
        <li>Formative Two Grading: ${activityLog.formativeTwoGrading}</li>
        <li>Summative Grading: ${activityLog.summativeGrading}</li>
        <li>Course Moderation: ${activityLog.courseModeration}</li>
        <li>Intranet Sync: ${activityLog.intranetSync}</li>
        <li>Grade Book Status: ${activityLog.gradeBookStatus}</li>
      </ul>
      ${activityLog.notes ? `<p><strong>Notes:</strong> ${activityLog.notes}</p>` : ''}
    `;

    const result = await sendEmail(
      facilitator.email,
      `Activity Log Submitted - Week ${activityLog.weekNumber}`,
      emailHtml
    );

    return result;
  } catch (error) {
    console.error('❌ Activity log notification failed:', error);
    return { success: false, error: error.message };
  }
};

const sendReminderNotification = async (facilitatorId, deadline) => {
  try {
    // Ensure database connection is available
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    
    const facilitator = await User.findByPk(facilitatorId);
    if (!facilitator) {
      throw new Error('Facilitator not found');
    }

    const pendingLogs = await ActivityTracker.findAll({
      where: {
        facilitatorId,
        isActive: true,
        submittedAt: null
      },
      include: [
        {
          model: CourseOffering,
          as: 'courseAllocation',
          include: [{ model: Module, as: 'module' }]
        }
      ]
    });

    if (pendingLogs.length === 0) {
      return { success: true, message: 'No pending logs found' };
    }

    const emailHtml = `
      <h2>Weekly Activity Log Reminder</h2>
      <p>Dear ${facilitator.firstName} ${facilitator.lastName},</p>
      <p>This is a reminder that you have pending activity logs that need to be submitted.</p>
      <p><strong>Deadline:</strong> ${deadline.toLocaleDateString()}</p>
      <hr>
      <h3>Pending Activity Logs:</h3>
      <ul>
        ${pendingLogs.map(log => `
          <li>${log.courseAllocation.module.name} (${log.courseAllocation.module.code}) - Week ${log.weekNumber}, ${log.year}</li>
        `).join('')}
      </ul>
      <p>Please log into the system and submit your activity logs before the deadline.</p>
    `;

    const result = await sendEmail(
      facilitator.email,
      'Weekly Activity Log Reminder',
      emailHtml
    );

    return result;
  } catch (error) {
    console.error('❌ Reminder notification failed:', error);
    return { success: false, error: error.message };
  }
};

const sendManagerAlert = async (managerId, alertType, data) => {
  try {
    // Ensure database connection is available
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    
    const manager = await User.findByPk(managerId);
    if (!manager) {
      throw new Error('Manager not found');
    }

    let subject, emailHtml;

    switch (alertType) {
      case 'missed_deadline':
        subject = 'Facilitator Missed Activity Log Deadline';
        emailHtml = `
          <h2>Activity Log Deadline Alert</h2>
          <p>Dear ${manager.firstName} ${manager.lastName},</p>
          <p>A facilitator has missed the weekly activity log deadline.</p>
          <hr>
          <h3>Details:</h3>
          <ul>
            <li><strong>Facilitator:</strong> ${data.facilitatorName}</li>
            <li><strong>Module:</strong> ${data.moduleName}</li>
            <li><strong>Week:</strong> ${data.weekNumber}, ${data.year}</li>
            <li><strong>Deadline:</strong> ${data.deadline}</li>
          </ul>
          <p>Please follow up with the facilitator to ensure compliance.</p>
        `;
        break;

      case 'late_submission':
        subject = 'Late Activity Log Submission';
        emailHtml = `
          <h2>Late Activity Log Submission</h2>
          <p>Dear ${manager.firstName} ${manager.lastName},</p>
          <p>A facilitator has submitted their activity log after the deadline.</p>
          <hr>
          <h3>Details:</h3>
          <ul>
            <li><strong>Facilitator:</strong> ${data.facilitatorName}</li>
            <li><strong>Module:</strong> ${data.moduleName}</li>
            <li><strong>Week:</strong> ${data.weekNumber}, ${data.year}</li>
            <li><strong>Submitted:</strong> ${data.submittedAt}</li>
            <li><strong>Deadline:</strong> ${data.deadline}</li>
          </ul>
        `;
        break;

      default:
        subject = 'Activity Tracker Alert';
        emailHtml = `
          <h2>Activity Tracker Alert</h2>
          <p>Dear ${manager.firstName} ${manager.lastName},</p>
          <p>An alert has been triggered in the activity tracker system.</p>
          <p><strong>Alert Type:</strong> ${alertType}</p>
          <p><strong>Data:</strong> ${JSON.stringify(data, null, 2)}</p>
        `;
    }

    const result = await sendEmail(manager.email, subject, emailHtml);
    return result;
  } catch (error) {
    console.error('❌ Manager alert failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  createNotification,
  createReminder,
  createAlert,
  sendActivityLogNotification,
  sendReminderNotification,
  sendManagerAlert
}; 