// Importar os serviços de email
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

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
    
    // Criar usuário
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verified: false,
      plan: 'free',
      settings: {
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
      }
    });
    
    // Enviar email de verificação
    await sendVerificationEmail(user);
    
    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      userId: user.id
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  // Implementação existente...
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
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ message: 'Token é obrigatório' });
      return;
    }
    
    // Buscar usuário pelo token
    const user = await User.findOne({ where: { verificationToken: token } });
    
    if (!user) {
      res.status(400).json({ message: 'Token inválido' });
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
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error in email verification:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};