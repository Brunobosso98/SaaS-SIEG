import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Define user interface
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  verified: boolean;
  verificationToken: string | null;
  resetToken?: string;
  resetTokenExpiry?: number;
  plan: string;
  createdAt: Date;
  siegKey: string | null;
  cnpjs: any[];
  settings: {
    documentTypes: string[];
    downloadConfig: {
      directory: string;
      retention: number;
    };
    notifications: {
      email: boolean;
      downloadComplete: boolean;
      downloadFailed: boolean;
    };
  };
}

// Mock user database (replace with actual database in production)
let users: User[] = [];

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = users.find(user => user.email === email);
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
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      verified: false,
      verificationToken,
      plan: 'free', // Default plan
      createdAt: new Date(),
      siegKey: null,
      cnpjs: [],
      settings: {
        documentTypes: ['nfe'],
        downloadConfig: {
          directory: 'NFS/ENTRADA/SAIDA/{YEAR}/{MONTH}/{CNPJ}',
          retention: 15 // days
        },
        notifications: {
          email: true,
          downloadComplete: true,
          downloadFailed: true
        }
      }
    };

    // Add user to database
    users.push(newUser);

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

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if user is verified
    if (!user.verified) {
      res.status(401).json({ message: 'Please verify your email before logging in' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
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

    // Find user
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex === -1) {
      res.status(400).json({ message: 'Invalid verification token' });
      return;
    }

    // Update user verification status
    users[userIndex].verified = true;
    users[userIndex].verificationToken = null;

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
    const user = users.find(user => user.email === email);
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      res.json({ message: 'If your email is registered, you will receive password reset instructions' });
      return;
    }

    // Create reset token
    const resetToken = jwt.sign(
      { id: user.id, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Store reset token with user
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

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
    const userIndex = users.findIndex(user => user.id === id && user.email === email);
    if (userIndex === -1) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    // Check if token is expired
    if (users[userIndex].resetTokenExpiry && users[userIndex].resetTokenExpiry < Date.now()) {
      res.status(400).json({ message: 'Reset token has expired' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    users[userIndex].password = hashedPassword;
    users[userIndex].resetToken = undefined;
    users[userIndex].resetTokenExpiry = undefined;

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};

// Helper function to send verification email
const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  // In a real app, you would configure a real email service
  // For now, we'll just log the verification link
  console.log(`Verification link: http://localhost:3000/verify-email?token=${token}`);

  // Example of how you would send an actual email
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Please click the link below to verify your email:</p>
           <a href="http://localhost:3000/verify-email?token=${token}">Verify Email</a>`
  };

  await transporter.sendMail(mailOptions);
  */
};

// Helper function to send password reset email
const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  // In a real app, you would configure a real email service
  // For now, we'll just log the reset link
  console.log(`Password reset link: http://localhost:3000/reset-password?token=${token}`);

  // Example of how you would send an actual email
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password',
    html: `<p>Please click the link below to reset your password:</p>
           <a href="http://localhost:3000/reset-password?token=${token}">Reset Password</a>`
  };

  await transporter.sendMail(mailOptions);
  */
};