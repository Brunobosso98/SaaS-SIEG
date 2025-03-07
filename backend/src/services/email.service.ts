import transporter from '../config/email.config';
import crypto from 'crypto';
import User from '../models/user.model';

export const sendVerificationEmail = async (user: any): Promise<void> => {
  try {
    // Generate a 6-digit verification code instead of a token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save the code in the database
    await User.update(
      { verificationToken: verificationCode },
      { where: { id: user.id } }
    );
    
    // Send email with the code
    await transporter.sendMail({
      from: `"SaaS-SIEG" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verifique seu email - SaaS-SIEG',
      html: `
        <h1>Bem-vindo ao SaaS-SIEG!</h1>
        <p>Por favor, use o código abaixo para verificar seu email:</p>
        <h2 style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px;">${verificationCode}</h2>
        <p>Insira este código na tela de verificação do aplicativo.</p>
        <p>Se você não solicitou esta verificação, ignore este email.</p>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
    throw new Error('Falha ao enviar email de verificação');
  }
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) return;
    
    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    await User.update(
      { 
        resetToken: resetCode,
        resetTokenExpiry
      },
      { where: { id: user.id } }
    );
    
    await transporter.sendMail({
      from: `"SaaS-SIEG" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de Senha - SaaS-SIEG',
      html: `
        <h1>Redefinição de Senha</h1>
        <p>Você solicitou a redefinição de sua senha. Use o código abaixo para criar uma nova senha:</p>
        <h2 style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px;">${resetCode}</h2>
        <p>Este código é válido por 1 hora.</p>
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email de redefinição:', error);
    throw new Error('Falha ao enviar email de redefinição');
  }
};