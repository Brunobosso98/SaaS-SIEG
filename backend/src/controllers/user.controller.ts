import { Request, Response } from 'express';
import User from '../models/user.model';
import CNPJ from '../models/cnpj.model';
import XML from '../models/xml.model';

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

// Define document type enum
enum DocumentType {
  NFe = 1,
  CTe = 2,
  NFSe = 3,
  NFCe = 4,
  CFe = 5
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

// Get user settings
export const getUserSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user.settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Server error while fetching settings' });
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

// Get document types
export const getDocumentTypes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({
      documentTypes: user.settings.documentTypes
    });
  } catch (error) {
    console.error('Error fetching document types:', error);
    res.status(500).json({ message: 'Server error while fetching document types' });
  }
};

// Update document types
export const updateDocumentTypes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { documentType } = req.body;
    
    // Validate document type
    if (!documentType || !Object.values(DocumentType).includes(Number(documentType))) {
      res.status(400).json({ 
        message: 'Invalid document type. Must be one of: 1 (NFe), 2 (CT-e), 3 (NFSe), 4 (NFCe), 5 (CF-e)' 
      });
      return;
    }
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Convert document type number to string representation
    let docTypeStr: string;
    switch (Number(documentType)) {
      case DocumentType.NFe: docTypeStr = 'nfe'; break;
      case DocumentType.CTe: docTypeStr = 'cte'; break;
      case DocumentType.NFSe: docTypeStr = 'nfse'; break;
      case DocumentType.NFCe: docTypeStr = 'nfce'; break;
      case DocumentType.CFe: docTypeStr = 'cfe'; break;
      default: docTypeStr = '';
    }
    
    if (docTypeStr === '') {
      res.status(400).json({ message: 'Invalid document type' });
      return;
    }
    
    // Ensure settings and documentTypes are properly initialized
    if (!user.settings) {
      user.settings = {
        documentTypes: [],
        downloadConfig: {
          directory: 'downloads',
          retention: 7
        },
        notifications: {
          email: true,
          downloadComplete: true,
          downloadFailed: true
        },
        schedule: {
          frequency: 'daily',
          times: ['08:00']
        }
      };
    }
    
    if (!user.settings.documentTypes) {
      user.settings.documentTypes = [];
    }
    
    // Check if document type already exists
    if (!user.settings.documentTypes.includes(docTypeStr)) {
      // Add the new document type
      user.settings.documentTypes.push(docTypeStr);
      
      // Explicitly mark the settings field as changed
      user.changed('settings', true);
      
      // Save changes
      await user.save();
      
      res.json({
        message: 'Document type added successfully',
        documentTypes: user.settings.documentTypes
      });
    } else {
      res.status(400).json({
        message: 'Document type already exists',
        documentTypes: user.settings.documentTypes
      });
    }
  } catch (error) {
    console.error('Error updating document types:', error);
    res.status(500).json({ message: 'Server error while updating document types' });
  }
};

// Delete document type
export const deleteDocumentType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { documentType } = req.body;
    
    // Validate document type
    if (!documentType || !Object.values(DocumentType).includes(Number(documentType))) {
      res.status(400).json({ 
        message: 'Invalid document type. Must be one of: 1 (NFe), 2 (CT-e), 3 (NFSe), 4 (NFCe), 5 (CF-e)' 
      });
      return;
    }
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Ensure settings and documentTypes are properly initialized
    if (!user.settings) {
      user.settings = {
        documentTypes: [],
        downloadConfig: {
          directory: 'downloads',
          retention: 7
        },
        notifications: {
          email: true,
          downloadComplete: true,
          downloadFailed: true
        },
        schedule: {
          frequency: 'daily',
          times: ['08:00']
        }
      };
    }
    
    // Ensure documentTypes is initialized as an array
    if (!user.settings.documentTypes) {
      user.settings.documentTypes = [];
      user.changed('settings', true);
      await user.save();
      res.status(404).json({ message: 'Document type not found' });
      return;
    }
    
    // Convert document type number to string representation
    let docTypeStr: string;
    switch (Number(documentType)) {
      case DocumentType.NFe: docTypeStr = 'nfe'; break;
      case DocumentType.CTe: docTypeStr = 'cte'; break;
      case DocumentType.NFSe: docTypeStr = 'nfse'; break;
      case DocumentType.NFCe: docTypeStr = 'nfce'; break;
      case DocumentType.CFe: docTypeStr = 'cfe'; break;
      default: docTypeStr = '';
    }
    
    if (docTypeStr === '') {
      res.status(400).json({ message: 'Invalid document type' });
      return;
    }
    
    // Check if document type exists
    const index = user.settings.documentTypes.indexOf(docTypeStr);
    if (index === -1) {
      res.status(404).json({ message: 'Document type not found' });
      return;
    }
    
    // Remove the document type
    user.settings.documentTypes.splice(index, 1);
    
    // Explicitly mark the settings field as changed
    user.changed('settings', true);
    
    // Save changes
    await user.save();
    
    res.json({
      message: 'Document type deleted successfully',
      documentTypes: user.settings.documentTypes
    });
  } catch (error) {
    console.error('Error deleting document type:', error);
    res.status(500).json({ message: 'Server error while deleting document type' });
  }
};

// Get download directory
export const getDownloadDirectory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({
      directory: user.settings.downloadConfig.directory
    });
  } catch (error) {
    console.error('Error fetching download directory:', error);
    res.status(500).json({ message: 'Server error while fetching download directory' });
  }
};

// Update download directory
export const updateDownloadDirectory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { directory } = req.body;
    
    // Validate directory
    if (!directory) {
      res.status(400).json({ message: 'Directory is required' });
      return;
    }
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update download directory
    user.settings = {
      ...user.settings,
      downloadConfig: {
        ...user.settings.downloadConfig,
        directory
      }
    } as UserSettings;
    
    // Save changes
    await user.save();
    
    res.json({
      message: 'Download directory updated successfully',
      directory: user.settings.downloadConfig.directory
    });
  } catch (error) {
    console.error('Error updating download directory:', error);
    res.status(500).json({ message: 'Server error while updating download directory' });
  }
};

// Get retention period
export const getRetentionPeriod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({
      retention: user.settings.downloadConfig.retention
    });
  } catch (error) {
    console.error('Error fetching retention period:', error);
    res.status(500).json({ message: 'Server error while fetching retention period' });
  }
};

// Update retention period
export const updateRetentionPeriod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { retention } = req.body;
    
    // Validate retention
    if (retention === undefined || retention < 1) {
      res.status(400).json({ message: 'Valid retention period is required' });
      return;
    }
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update retention period
    user.settings = {
      ...user.settings,
      downloadConfig: {
        ...user.settings.downloadConfig,
        retention
      }
    } as UserSettings;
    
    // Save changes
    await user.save();
    
    res.json({
      message: 'Retention period updated successfully',
      retention: user.settings.downloadConfig.retention
    });
  } catch (error) {
    console.error('Error updating retention period:', error);
    res.status(500).json({ message: 'Server error while updating retention period' });
  }
};

// Get notification settings
export const getNotificationSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({
      notifications: user.settings.notifications
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ message: 'Server error while fetching notification settings' });
  }
};

// Update notification settings
export const updateNotificationSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { notifications } = req.body;
    
    // Validate notifications
    if (!notifications) {
      res.status(400).json({ message: 'Notification settings are required' });
      return;
    }
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update notification settings
    user.settings = {
      ...user.settings,
      notifications: {
        ...user.settings.notifications,
        ...notifications
      }
    } as UserSettings;
    
    // Save changes
    await user.save();
    
    res.json({
      message: 'Notification settings updated successfully',
      notifications: user.settings.notifications
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Server error while updating notification settings' });
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