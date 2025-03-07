import { sequelize } from '../config/database';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables with absolute path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function updateTestUserPassword() {
  try {
    // Create a known password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    console.log('Generated hash:', hashedPassword);
    
    // Find the test user
    const user = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (!user) {
      console.log('Test user not found');
      return;
    }
    
    // Update the password directly
    await User.update(
      { password: hashedPassword },
      { where: { email: 'test@example.com' } }
    );
    
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await sequelize.close();
  }
}

updateTestUserPassword();