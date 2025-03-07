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
    const hashedPassword = await bcrypt.hash('brunao', salt);
    
    console.log('Generated hash:', hashedPassword);
    
    // Find the test user
    const user = await User.findOne({ where: { email: 'brunobossomartins1@gmail.com' } });
    
    if (!user) {
      console.log('Test user not found');
      return;
    }
    
    // Update the password directly
    await User.update(
      { password: hashedPassword },
      { where: { email: 'brunobossomartins1@gmail.com' } }
    );
    
    console.log('Password updated successfully');
    console.log('Test user email: brunobossomartins1@gmail.com');
    console.log('Test user password: brunao');
    
    // Test the password verification
    const updatedUser = await User.findOne({ where: { email: 'brunobossomartins1@gmail.com' } });
    if (updatedUser) {
      const isMatch = await bcrypt.compare('brunao', updatedUser.password);
      console.log('Password verification test:', isMatch ? 'SUCCESS' : 'FAILED');
    }
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await sequelize.close();
  }
}

updateTestUserPassword();