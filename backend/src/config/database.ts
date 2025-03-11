import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables first
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Log connection parameters for debugging
console.log('Database connection parameters:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`Password length: ${process.env.DB_PASSWORD?.length || 0}`);

// Create a new Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'xmlfiscal',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Test the connection and sync models
const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models with the database
    // This will create tables if they don't exist
    await sequelize.sync();
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database or sync models:', error);
    throw error; // Re-throw to allow handling in calling code
  }
};

export { sequelize, testConnection };