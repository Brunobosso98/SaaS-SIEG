import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Create new user
    const newUser = await User.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      verified: false,
      verificationToken,
      plan: 'free',
      siegKey: null,
      settings: {
        documentTypes: ['nfe'],
        downloadConfig: {
          directory: 'NFS/ENTRADA/SAIDA/{YEAR}/{MONTH}/{CNPJ}',
          retention: 15
        },
        notifications: {
          email: true,
          downloadComplete: true,
          downloadFailed: true
        }
      }
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: newUser.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    console.log(`Attempting login for email: ${email}`);

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found');
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }
    
    console.log(`User found: ${user.email}, verified: ${user.verified}`);
    
    // Check if user is verified
    if (!user.verified) {
      res.status(401).json({ message: 'Please verify your email before logging in' });
      return;
    }
    
    // Log password details for debugging (remove in production)
    console.log(`Stored password hash length: ${user.password.length}`);
    console.log(`Input password: ${password}`);
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match result: ${isMatch}`);
    
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, plan: user.plan },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as jwt.JwtPayload;
    const { email } = decoded;

    // Find and update user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(400).json({ message: 'Invalid verification token' });
      return;
    }

    await user.update({
      verified: true,
      verificationToken: null
    });

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ message: 'Invalid or expired verification token' });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.json({ message: 'If your email is registered, you will receive password reset instructions' });
      return;
    }

    // Create reset token
    const resetToken = jwt.sign(
      { id: user.id, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Update user with reset token
    await user.update({
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
    });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'If your email is registered, you will receive password reset instructions' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as jwt.JwtPayload;
    const { id, email } = decoded;

    // Find user
    const user = await User.findOne({
      where: {
        id,
        email,
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};

// Helper function to send verification email
const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  console.log(`Verification link: http://localhost:3000/verify-email?token=${token}`);
};

// Helper function to send password reset email
const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  console.log(`Password reset link: http://localhost:3000/reset-password?token=${token}`);
};