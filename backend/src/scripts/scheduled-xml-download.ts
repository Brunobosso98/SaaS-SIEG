import User from '../models/user.model';
import CNPJ from '../models/cnpj.model';
import SiegService from '../services/sieg.service';
import { scheduleJob } from 'node-schedule';
import { Op } from 'sequelize';

/**
 * Scheduled XML Download Service
 * 
 * This script handles scheduled XML downloads based on user configurations.
 * It ensures users can only access their own data and automatically retrieves
 * the necessary information from the database.
 */

/**
 * Get date range for XML downloads
 * Default is 5 days before current date to current date
 */
function getDateRange(days: number = 5): { startDate: string, endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * Execute XML download for a specific user
 * This function retrieves all necessary data from the database:
 * 1. User's CNPJs
 * 2. User's SIEG key
 * 3. Date range (default: 5 days before current date to current date)
 * 4. Document types from user settings
 * 5. User's token/authentication is verified through the user ID
 */
async function executeXmlDownload(userId: string): Promise<any> {
  try {
    // Get user with their settings
    const user = await User.findByPk(userId);
    if (!user) {
      console.error(`❌ User ${userId} not found`);
      return { success: false, message: 'User not found' };
    }

    // Check if user has SIEG API key
    if (!user.siegKey) {
      console.warn(`⚠️ User ${userId} has no SIEG API key configured`);
      return { success: false, message: 'No SIEG API key configured' };
    }

    // Get all active CNPJs for the user
    const cnpjs = await CNPJ.findAll({
      where: {
        userId,
        active: true
      }
    });

    if (cnpjs.length === 0) {
      console.warn(`⚠️ User ${userId} has no active CNPJs`);
      return { success: false, message: 'No active CNPJs found' };
    }

    // Get document types from user settings
    const documentTypes = user.settings?.documentTypes || ['nfe'];
    if (documentTypes.length === 0) {
      console.warn(`⚠️ User ${userId} has no document types configured`);
      return { success: false, message: 'No document types configured' };
    }

    // Get date range (default: 5 days)
    const { startDate, endDate } = getDateRange(5);

    console.info(`🔄 Starting XML download for user ${user.name} (${userId})`);
    console.info(`📄 Document types: ${documentTypes.join(', ')}`);
    console.info(`📅 Date range: ${startDate} to ${endDate}`);
    console.info(`🏢 Processing ${cnpjs.length} CNPJs`);

    // Process each CNPJ
    const results = [];
    for (const cnpj of cnpjs) {
      console.info(`🔹 Processing CNPJ: ${cnpj.cnpj}`);
      const result = await SiegService.downloadXmlsForCnpj(
        userId,
        cnpj.id,
        documentTypes,
        startDate,
        endDate,
        'automatic'
      );
      results.push({
        cnpj: cnpj.cnpj,
        ...result
      });
    }

    console.info(`✅ Completed XML download for user ${user.name}`);
    return {
      success: true,
      results,
      message: `Processed ${cnpjs.length} CNPJs`
    };
  } catch (error) {
    console.error(`❌ Error downloading XMLs for user ${userId}:`, error);
    return { success: false, message: `Error: ${error}` };
  }
}

/**
 * Schedule XML downloads for all users based on their individual settings
 */
async function scheduleAllUserDownloads(): Promise<void> {
  try {
    // Get all active users with SIEG API key configured
    const users = await User.findAll({
      where: {
        verified: true,
        siegKey: {
          [Op.ne]: null
        }
      }
    });

    console.info(`📅 Scheduling XML downloads for ${users.length} users`);

    // Clear any existing scheduled jobs
    // This assumes you're using a job management system that allows this
    // If using node-schedule, you would need to keep references to all jobs

    for (const user of users) {
      // Skip users without schedule settings
      if (!user.settings?.schedule?.frequency || !user.settings?.schedule?.times?.length) {
        console.warn(`⚠️ User ${user.id} has no schedule configured. Skipping...`);
        continue;
      }

      const { frequency, times } = user.settings.schedule;
      
      // Schedule based on frequency and times
      for (const time of times) {
        const [hour, minute] = time.split(':').map(Number);
        
        let cronExpression = '';
        
        // Convert frequency to cron expression
        switch (frequency) {
          case 'daily':
            cronExpression = `${minute} ${hour} * * *`;
            break;
          case '2x ao dia':
            // For twice daily, we'll schedule at the specified time and 12 hours later
            cronExpression = `${minute} ${hour},${(hour + 12) % 24} * * *`;
            break;
          case '4x ao dia':
            // For 4x daily, schedule every 6 hours starting from specified time
            cronExpression = `${minute} ${hour},${(hour + 6) % 24},${(hour + 12) % 24},${(hour + 18) % 24} * * *`;
            break;
          case 'weekly':
            // For weekly, schedule on Monday at the specified time
            cronExpression = `${minute} ${hour} * * 1`;
            break;
          default:
            // Default to daily at the specified time
            cronExpression = `${minute} ${hour} * * *`;
        }
        
        console.info(`📅 Scheduling XML download for user ${user.id} with cron: ${cronExpression}`);
        
        // Schedule the job
        scheduleJob(cronExpression, async () => {
          console.info(`🕒 Running scheduled XML download for user ${user.id}`);
          await executeXmlDownload(user.id);
        });
      }
    }

    console.info(`✅ XML download scheduler initialized for all users`);
  } catch (error) {
    console.error(`❌ Error scheduling XML downloads:`, error);
  }
}

/**
 * Initialize the XML download scheduler
 * This function should be called when the application starts
 */
export function initializeXmlDownloadScheduler(): void {
  // Schedule the main job that will re-schedule all user jobs daily at midnight
  // This ensures that any changes to user settings are picked up
  scheduleJob('0 0 * * *', async () => {
    console.info(`🔄 Refreshing XML download schedules for all users`);
    await scheduleAllUserDownloads();
    
    // Clean up expired XMLs
    console.info(`🧹 Cleaning up expired XMLs`);
    await SiegService.cleanupExpiredXmls();
  });
  
  // Initial scheduling
  scheduleAllUserDownloads();
  
  console.info(`🚀 XML download scheduler initialized`);
}

// If this script is run directly, initialize the scheduler
if (require.main === module) {
  (async () => {
    try {
      console.info(`🚀 Initializing XML download scheduler`);
      initializeXmlDownloadScheduler();
    } catch (error) {
      console.error(`❌ Fatal error:`, error);
      process.exit(1);
    }
  })();
}

// Export functions for use in other modules
export {
  executeXmlDownload,
  scheduleAllUserDownloads,
  getDateRange
};