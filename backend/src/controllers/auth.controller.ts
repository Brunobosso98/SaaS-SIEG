import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

// Registro de usuário
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Validar dados
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      return;
    }
    
    if (password !== confirmPassword) {
      res.status(400).json({ message: 'As senhas não coincidem' });
      return;
    }
    
    // Verificar se o email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email já está em uso' });
      return;
    }
    
    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Get the actual table name from the model
    const tableName = User.getTableName();
    
    // Use raw query to bypass model hooks with correct table name
    const [results] = await sequelize.query(`
      INSERT INTO "${tableName}" (
        "id", "name", "email", "password", "verified", 
        "plan", "settings", "created_at", "updated_at"
      ) VALUES (
        :id, :name, :email, :password, :verified,
        :plan, :settings, :created_at, :updated_at
      ) RETURNING *
    `, {
      replacements: {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        verified: false,
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
    }) as unknown as [any[], number];
    
    // The results is an array of objects, get the first row
    const userData = results[0] as any;
    
    // Convert the raw query result to a User instance
    const createdUser = await User.findByPk(userData.id);
    
    // Enviar email de verificação
    await sendVerificationEmail(createdUser);
    
    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      userId: userData.id
    });}
   catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    // Find user by email
    console.log('Fetching user from database...');
    const user = await User.findOne({ 
      where: { email }
    });
    
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Debug logs
    console.log('Login attempt for user:', email);
    console.log('Password provided:', password);
    console.log('Password length:', password.length);
    console.log('Password character codes:', [...password].map(c => c.charCodeAt(0)));
    console.log('Stored hashed password:', user.password);
    console.log('Stored hash length:', user.password.length);
    
    // Use bcrypt directly to compare passwords
    const isMatch = await user.checkPassword(password);
    console.log('Password match result:', isMatch);
    
    // If login fails, try to create a new hash and compare the hashes
    if (!isMatch) {
      // Try with trimmed password in case there are whitespace issues
      const trimmedPassword = password.trim();
      if (trimmedPassword !== password) {
        console.log('Password had whitespace, trying with trimmed password');
        const isTrimmedMatch = await user.checkPassword(trimmedPassword);
        console.log('Trimmed password match result:', isTrimmedMatch);
      }
      
      // Try with a fresh hash to see if bcrypt is working correctly
      const salt = await bcrypt.genSalt(10);
      const testHash = await bcrypt.hash('test', salt);
      const testMatch = await bcrypt.compare('test', testHash);
      console.log('Test bcrypt functionality:', testMatch ? 'WORKING' : 'FAILING');
    }
    
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Check if email is verified
    if (!user.verified) {
      // Generate a new verification code and send it
      await sendVerificationEmail(user);
      
      res.status(403).json({ 
        message: 'Email not verified. A new verification code has been sent to your email.',
        verified: false,
        userId: user.id
      });
      return;
    }
    
    // Generate JWT token
    const secretKey = process.env.JWT_SECRET || "your_fallback_secret_key";
    const token = jwt.sign(
      { id: user.id },
      secretKey,
      { expiresIn: '1d' }
    );

    // Send response
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

// Esqueci a senha
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ message: 'Email é obrigatório' });
      return;
    }
    
    // Enviar email de redefinição
    await sendPasswordResetEmail(email);
    
    // Sempre retornar sucesso, mesmo se o email não existir (por segurança)
    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Redefinir senha
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    if (!token || !password) {
      res.status(400).json({ message: 'Token e senha são obrigatórios' });
      return;
    }
    
    if (password !== confirmPassword) {
      res.status(400).json({ message: 'As senhas não coincidem' });
      return;
    }
    
    // Buscar usuário pelo token
    const user = await User.findOne({ 
      where: { 
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() } // Token ainda válido
      } 
    });
    
    if (!user) {
      res.status(400).json({ message: 'Token inválido ou expirado' });
      return;
    }
    
    // Criar hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Atualizar senha e limpar tokens
    await User.update(
      { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      },
      { where: { id: user.id } }
    );
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// Verificar email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      res.status(400).json({ message: 'Email e código de verificação são obrigatórios' });
      return;
    }
    
    // Buscar usuário pelo email e código
    const user = await User.findOne({ 
      where: { 
        email: email,
        verificationToken: code 
      } 
    });
    
    if (!user) {
      res.status(400).json({ message: 'Código de verificação inválido' });
      return;
    }
    
    // Marcar email como verificado e limpar token
    await User.update(
      { 
        verified: true,
        verificationToken: null
      },
      { where: { id: user.id } }
    );
    
    res.json({ message: 'Email verificado com sucesso' });
  } catch (error) {
    console.error('Erro na verificação de email:', error);
    res.status(500).json({ message: 'Erro no servidor durante a verificação de email' });
  }
};