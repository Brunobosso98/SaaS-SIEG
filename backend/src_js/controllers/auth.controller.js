const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Mock user database (replace with actual database in production)
let users = [];

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
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
    const newUser = {
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
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
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
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { email } = decoded;

    // Find user
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex === -1) {
      return res.status(400).json({ message: 'Invalid verification token' });
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
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.json({ message: 'If your email is registered, you will receive password reset instructions' });
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
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { id, email } = decoded;

    // Find user
    const userIndex = users.findIndex(user => user.id === id && user.email === email);
    if (userIndex === -1) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (users[userIndex].resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    users[userIndex].password = hashedPassword;
    users[userIndex].resetToken = null;
    users[userIndex].resetTokenExpiry = null;

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};

// Helper function to send verification email
async function sendVerificationEmail(email, token) {
  // In a real app, you would configure a proper email service
  // For now, we'll just log the verification link
  const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
  console.log(`Verification link for ${email}: ${verificationLink}`);

  // Example of how to send email with nodemailer (commented out)
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: '"XMLFiscal" <noreply@xmlfiscal.com>',
    to: email,
    subject: 'Verifique seu email - XMLFiscal',
    html: `
      <h1>Bem-vindo ao XMLFiscal!</h1>
      <p>Por favor, clique no link abaixo para verificar seu email:</p>
      <a href="${verificationLink}">Verificar Email</a>
      <p>Este link expira em 24 horas.</p>
    `
  });
  */
}

// Helper function to send password reset email
async function sendPasswordResetEmail(email, token) {
  // In a real app, you would configure a proper email service
  // For now, we'll just log the reset link
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  console.log(`Password reset link for ${email}: ${resetLink}`);

  // Example of how to send email with nodemailer (commented out)
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: '"XMLFiscal" <noreply@xmlfiscal.com>',
    to: email,
    subject: 'Redefinição de Senha - XMLFiscal',
    html: `
      <h1>Redefinição de Senha</h1>
      <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:</p>
      <a href="${resetLink}">Redefinir Senha</a>
      <p>Este link expira em 1 hora.</p>
      <p>Se você não solicitou esta redefinição, ignore este email.</p>
    `
  });
  */
}