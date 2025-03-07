// Import dotenv first to ensure environment variables are loaded
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables with absolute path BEFORE other imports
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Now import other modules
import { sequelize, testConnection } from '../config/database';
import { QueryTypes } from 'sequelize'; // Add this import
import User from '../models/user.model';
import CNPJ from '../models/cnpj.model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Define associations
// User.hasMany(CNPJ, {
//   sourceKey: 'id',
//   foreignKey: 'userId',
//   as: 'cnpjs'
// });

// Initialize database and create test user
async function initDatabase() {
  try {
    // Test database connection
    await testConnection();
    
    // Sync all models with database
    console.log('Syncing database models...');
    await sequelize.sync({ force: true }); // This will drop tables if they exist
    console.log('Database synchronized successfully.');
    
    // Create test user with direct password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('brunaogostoso', salt);
    
    // Get the actual table name from the model
    const tableName = User.getTableName();
    console.log(`Using table name: ${tableName}`);
    
    // Use raw query to bypass model hooks with correct table name
    await sequelize.query(`
      INSERT INTO "${tableName}" (
        "id", "name", "email", "password", "verified", 
        "plan", "settings", "created_at", "updated_at"
      ) VALUES (
        :id, :name, :email, :password, :verified,
        :plan, :settings, :created_at, :updated_at
      )
    `, {
      replacements: {
        id: uuidv4(),
        name: 'Test User',
        email: 'brunao@example.com',
        password: hashedPassword,
        verified: true,
        plan: 'free',
        settings: JSON.stringify({
          documentTypes: ['nfe'],
          downloadConfig: {
            directory: 'downloads',
            retention: 7
          },
          notifications: {
            email: true,
            downloadComplete: true,
            downloadFailed: true
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      type: QueryTypes.INSERT
    });
    
    console.log('Test user created successfully:');
    console.log(`Email: brunao@example.com`);
    console.log(`Password: brunaogostoso`);
    
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the initialization
initDatabase();