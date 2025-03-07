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
    
    // Log models being synced
    console.log('Models to sync:');
    console.log('- User model:', User.name);
    console.log('- CNPJ model:', CNPJ.name);
    
    // Sync all models with database
    console.log('Syncing database models...');
    await sequelize.sync({ force: true });
    
    // Log all tables after sync
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `, { type: QueryTypes.SELECT });
    
    console.log('\nCreated tables:');
    tables.forEach((table: any) => {
      console.log(`- ${table.table_name}`);
    });
    console.log('\nDatabase synchronized successfully.');
    
    // Create test user with direct password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('brunaogostoso', salt);
    
    const userId = uuidv4();
    
    // Get the actual table name from the model
    const tableName = User.getTableName();
    
    // Use raw query to bypass model hooks with correct table name
    await sequelize.query(`
      INSERT INTO "${tableName}" (
        "id", "name", "email", "password", "verified", 
        "plan", "settings", "sieg_key", "verification_token",
        "reset_token", "reset_token_expiry", "created_at", "updated_at"
      ) VALUES (
        :id, :name, :email, :password, :verified,
        :plan, :settings, :siegKey, :verificationToken,
        :resetToken, :resetTokenExpiry, :created_at, :updated_at
      )
    `, {
      replacements: {
        id: userId,
        name: 'Test User',
        email: 'brunao@example.com',
        password: hashedPassword,
        verified: true,
        plan: 'professional',
        settings: JSON.stringify({
          documentTypes: ['nfe', 'nfce'],
          downloadConfig: {
            directory: 'downloads',
            retention: 30
          },
          notifications: {
            email: true,
            downloadComplete: true,
            downloadFailed: true
          },
          schedule: {
            frequency: 'daily',
            times: ['08:00', '14:00']
          }
        }),
        siegKey: 'test-sieg-key-123456',
        verificationToken: null,
        resetToken: null,
        resetTokenExpiry: null,
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
    await sequelize.close();
  }
}

// Run the initialization
initDatabase();