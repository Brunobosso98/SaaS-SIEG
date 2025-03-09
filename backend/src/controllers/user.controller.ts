import { Request, Response } from 'express';
import User from '../models/user.model';
import CNPJ from '../models/cnpj.model';

// Define interfaces
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
    name?: string;
    plan?: string;
    siegKey?: string;
    settings?: UserSettings;
  };
}

interface UserSettings {
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
  schedule: {
    frequency: string;
    times: string[];
  };
}

interface PlanDetails {
  maxCNPJs: number;
  downloadFrequency: string[];
  retentionDays: number;
  features: string[];
}

// Get user profile
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Find user by ID
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken', 'resetToken', 'resetTokenExpiry'] }
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email && email !== user.email) {
      // Check if email is already in use
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
      user.email = email;
      // In a real app, you might want to verify the new email
    }
    
    // Save changes
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error while updating user profile' });
  }
};

// Get user subscription
export const getUserSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Find user by ID
    const user = await User.findByPk(userId, {
      attributes: ['id', 'plan']
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Get plan details based on user's plan
    const planDetails = getPlanDetails(user.plan);
    
    res.json({
      currentPlan: user.plan,
      ...planDetails
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ message: 'Server error while fetching subscription details' });
  }
};

// Update user settings
export const updateUserSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update settings
    if (settings) {
      // Merge existing settings with new settings
      user.settings = { ...user.settings, ...settings } as UserSettings;
    }
    
    // Save changes
    await user.save();
    
    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Server error while updating settings' });
  }
};

// Save user SIEG key
export const saveUserSiegKey = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { siegKey } = req.body;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update SIEG key
    if (req.method === 'POST') {
      if (!siegKey) {
        res.status(400).json({ message: 'SIEG key is required' });
        return;
      }
      
      user.siegKey = siegKey;
      await user.save();
      
      res.json({
        message: 'SIEG key saved successfully'
      });
    } else if (req.method === 'GET') {
      // Return the SIEG key (masked for security)
      const maskedKey = user.siegKey ? maskSiegKey(user.siegKey) : null;
      
      res.json({
        siegKey: maskedKey
      });
    }
  } catch (error) {
    console.error('Error managing SIEG key:', error);
    res.status(500).json({ message: 'Server error while managing SIEG key' });
  }
};
// Get user CNPJs
export const getUserCNPJs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Find all CNPJs associated with the user
    const cnpjs = await CNPJ.findAll({
      where: { userId, active: true },
      attributes: ['id', 'cnpj', 'active']
    });
    
    res.json(cnpjs);
  } catch (error) {
    console.error('Error fetching user CNPJs:', error);
    res.status(500).json({ message: 'Server error while fetching CNPJs' });
  }
};

// Helper function to get plan details
function getPlanDetails(planName: string): PlanDetails {
  const plans: Record<string, PlanDetails> = {
    free: {
      maxCNPJs: 1,
      downloadFrequency: ['1x ao dia'],
      retentionDays: 7,
      features: ['Download automático 1x ao dia', 'Download manual']
    },
    starter: {
      maxCNPJs: 3,
      downloadFrequency: ['1x ao dia'],
      retentionDays: 7,
      features: ['Até 3 CNPJs', 'Download automático 1x ao dia', '7 dias de retenção de arquivos', 'Suporte por email', 'Relatórios básicos', 'Download manual']
    },
    professional: {
      maxCNPJs: 10,
      downloadFrequency: ['1x ao dia', '2x ao dia'],
      retentionDays: 30,
      features: ['Até 10 CNPJs', 'Download automático 2x ao dia', '30 dias de retenção de arquivos', 'Suporte prioritário', 'Relatórios avançados', 'Download manual', 'Múltiplos horários de download']
    },
    enterprise: {
      maxCNPJs: 30,
      downloadFrequency: ['1x ao dia', '2x ao dia', '4x ao dia', 'Personalizado'],
      retentionDays: 90,
      features: ['Até 30 CNPJs', 'Download automático 4x ao dia', '90 dias de retenção de arquivos', 'Suporte dedicado', 'Relatórios personalizados', 'Download manual ilimitado', 'Múltiplos horários de download', 'Acesso a API', 'White label']
    }
  };
  
  return plans[planName] || plans.free;
}

// Helper function to mask SIEG key for security
function maskSiegKey(key: string): string {
  if (!key || key.length < 8) return '********';
  
  // Show only first 4 and last 4 characters
  const firstFour = key.substring(0, 4);
  const lastFour = key.substring(key.length - 4);
  const masked = '*'.repeat(key.length - 8);
  
  return `${firstFour}${masked}${lastFour}`;
}
// Update user plan
export const updateUserPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;
    
    // Validate plan
    const validPlans = ['free', 'starter', 'professional', 'enterprise'];
    if (!plan || !validPlans.includes(plan)) {
      res.status(400).json({ message: 'Invalid plan. Must be one of: free, starter, professional, enterprise' });
      return;
    }
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update plan
    user.plan = plan as 'free' | 'starter' | 'professional' | 'enterprise';
    
    // Save changes
    await user.save();
    
    res.json({
      message: 'Plan updated successfully',
      plan: user.plan
    });
  } catch (error) {
    console.error('Error updating user plan:', error);
    res.status(500).json({ message: 'Server error while updating plan' });
  }
};