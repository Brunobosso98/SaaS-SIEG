import transporter from '../config/email.config';
import crypto from 'crypto';
import User from '../models/user.model';

export const sendVerificationEmail = async (user: any): Promise<void> => {
  try {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    await User.update(
      { verificationToken },
      { where: { id: user.id } }
    );
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: `"SaaS-SIEG" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verifique seu email - SaaS-SIEG',
      html: `
        <h1>Bem-vindo ao SaaS-SIEG!</h1>
        <p>Por favor, verifique seu email clicando no link abaixo:</p>
        <a href="${verificationUrl}">Verificar Email</a>
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
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    await User.update(
      { 
        resetToken,
        resetTokenExpiry
      },
      { where: { id: user.id } }
    );
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: `"SaaS-SIEG" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de Senha - SaaS-SIEG',
      html: `
        <h1>Redefinição de Senha</h1>
        <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}">Redefinir Senha</a>
        <p>Este link é válido por 1 hora.</p>
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email de redefinição:', error);
    throw new Error('Falha ao enviar email de redefinição');
  }
};