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
import XML from '../models/xml.model'; // Add XML model import
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Define interface for database table information
interface TableInfo {
  table_name: string;
  [key: string]: unknown;
}

// Initialize database and create test user
async function initDatabase() {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize model associations
    User.hasMany(CNPJ, {
      sourceKey: 'id',
      foreignKey: 'userId',
      as: 'cnpjs'
    });
    
    CNPJ.belongsTo(User, {
      targetKey: 'id',
      foreignKey: 'userId',
      as: 'user'
    });
    
    // Add XML associations
    
    // Log models being synced
    console.log('Models to sync:');
    console.log('- User model:', User.name);
    console.log('- CNPJ model:', CNPJ.name);
    console.log('- XML model:', XML.name);
    
    // Sync all models with database
    console.log('Syncing database models...');
    
    // Drop the 'xmls' table if it exists
    try {
      await sequelize.getQueryInterface().dropTable('xmls');
      console.log("Dropped 'xmls' table.");
    } catch (error) {
      console.warn("Error dropping 'xmls' table (it might not exist yet):", error);
    }

    await sequelize.sync({ force: true });

    // Log the SQL for index creation (for debugging)
    const xmlModel = sequelize.models.XML;
    if (xmlModel) {
      const indexes = await sequelize.getQueryInterface().showIndex(xmlModel.tableName);
      console.log("Indexes for 'xmls' table:", indexes);
    }
    
    // Log all tables after sync
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `, { type: QueryTypes.SELECT }) as TableInfo[];
    
    console.log('\nCreated tables:');
    tables.forEach((table: TableInfo) => {
      console.log(`- ${table.table_name}`);
    });
    
    console.log('\nDatabase synchronized successfully.');
    
    // Create test user with direct password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('brunao', salt);
    
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
        email: 'brugala2001@gmail.com',
        password: hashedPassword,
        verified: false, // Changed to false to test verification
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
    console.log(`Email: brugala2001@gmail.com`);
    console.log(`Password: brunao`);
    
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the initialization
initDatabase();
