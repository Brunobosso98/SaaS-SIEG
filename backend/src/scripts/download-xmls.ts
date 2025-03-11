import User from '../models/user.model';
import SiegService from '../services/sieg.service';
import { Op } from 'sequelize';
import { scheduleJob } from 'node-schedule';

/**
 * Downloads XMLs for a specific user based on their settings
 */
async function downloadXmlsForUser(userId: string): Promise<any> {
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

    // Get document types from user settings
    const documentTypes = user.settings?.documentTypes || ['nfe'];
    
    // Get retention days based on user's plan
    let days = 5; // Default for most plans
    
    // Adjust days based on plan
    switch (user.plan) {
      case 'starter':
        days = 7;
        break;
      case 'professional':
        days = 30;
        break;
      case 'enterprise':
        days = 90;
        break;
      default:
        days = 5;
    }

    console.info(`🔄 Starting automatic XML download for user ${user.name} (${userId})`);
    console.info(`📄 Document types: ${documentTypes.join(', ')}`);
    console.info(`📅 Days to download: ${days}`);

    // Download XMLs for user
    const result = await SiegService.downloadXmlsForUser(userId, documentTypes, days, 'automatic');
    
    console.info(`✅ Completed XML download for user ${user.name}: ${result.message}`);
    return result;
  } catch (error) {
    console.error(`❌ Error downloading XMLs for user ${userId}: ${error}`);
    return { success: false, message: `Error: ${error}` };
  }
}

/**
 * Downloads XMLs for all active users
 */
async function downloadXmlsForAllUsers(): Promise<any> {
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

    console.info(`🔄 Starting automatic XML download for ${users.length} users`);

    const results = [];
    for (const user of users) {
      const result = await downloadXmlsForUser(user.id);
      results.push({
        userId: user.id,
        ...result
      });
    }

    console.info(`✅ Completed XML download for all users`);
    return {
      success: true,
      results,
      message: `Processed ${users.length} users`
    };
  } catch (error) {
    console.error(`❌ Error downloading XMLs for all users: ${error}`);
    return { success: false, message: `Error: ${error}` };
  }
}

/**
 * Schedule XML downloads based on user settings
 */
function scheduleXmlDownloads() {
  // Schedule daily download at 3 AM
  scheduleJob('0 3 * * *', async () => {
    console.info(`🕒 Running scheduled XML download for all users`);
    await downloadXmlsForAllUsers();
    
    // Clean up expired XMLs
    console.info(`🧹 Cleaning up expired XMLs`);
    await SiegService.cleanupExpiredXmls();
  });

  console.info(`📅 XML download scheduler initialized`);
}

// If this script is run directly, download XMLs for all users
if (require.main === module) {
  (async () => {
    try {
      console.info(`🚀 Starting manual XML download for all users`);
      await downloadXmlsForAllUsers();
      
      // Clean up expired XMLs
      console.info(`🧹 Cleaning up expired XMLs`);
      await SiegService.cleanupExpiredXmls();
      
      process.exit(0);
    } catch (error) {
      console.error(`❌ Fatal error: ${error}`);
      process.exit(1);
    }
  })();
} else {
  // If imported as a module, export functions
  scheduleXmlDownloads();
}

export {
  downloadXmlsForUser,
  downloadXmlsForAllUsers,
  scheduleXmlDownloads
};