import { Request, Response } from 'express';
import CNPJ from '../models/cnpj.model';
import User from '../models/user.model';

// Define interfaces
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

interface CNPJConfig {
  directory?: string;
  retention?: number;
  schedule?: {
    frequency: string;
    time: string;
  };
}

// Get all CNPJs for the authenticated user
export const getAllCNPJs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Find all CNPJs associated with the user
    const cnpjs = await CNPJ.findAll({
      where: { userId },
      attributes: ['id', 'cnpj', 'razaoSocial', 'nomeFantasia', 'active', 'downloadConfig', 'createdAt', 'updatedAt']
    });
    
    res.json(cnpjs);
  } catch (error) {
    console.error('Error fetching CNPJs:', error);
    res.status(500).json({ message: 'Server error while fetching CNPJs' });
  }
};

// Get CNPJ by ID
export const getCNPJById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const cnpjId = req.params.id;
    
    // Find CNPJ by ID and ensure it belongs to the authenticated user
    const cnpj = await CNPJ.findOne({
      where: { id: cnpjId, userId },
      attributes: ['id', 'cnpj', 'razaoSocial', 'nomeFantasia', 'active', 'downloadConfig', 'createdAt', 'updatedAt']
    });
    
    if (!cnpj) {
      res.status(404).json({ message: 'CNPJ not found' });
      return;
    }
    
    res.json(cnpj);
  } catch (error) {
    console.error('Error fetching CNPJ:', error);
    res.status(500).json({ message: 'Server error while fetching CNPJ' });
  }
};

// Add new CNPJ
export const addCNPJ = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { cnpj, razaoSocial, nomeFantasia, downloadConfig } = req.body;
    
    // Validate CNPJ format
    if (!cnpj || cnpj.length !== 14 || !/^\d+$/.test(cnpj)) {
      res.status(400).json({ message: 'Invalid CNPJ format. Must be 14 digits.' });
      return;
    }
    
    // Check if user has reached their CNPJ limit based on plan
    const user = await User.findByPk(userId, {
      attributes: ['plan'],
      include: [{
        model: CNPJ,
        as: 'cnpjs',
        where: { active: true },
        required: false
      }]
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Get plan details to check CNPJ limit
    const planDetails = getPlanDetails(user.plan);
    const currentCNPJCount = user.cnpjs ? user.cnpjs.length : 0;
    
    if (currentCNPJCount >= planDetails.maxCNPJs) {
      res.status(403).json({
        message: `You have reached the maximum number of CNPJs (${planDetails.maxCNPJs}) allowed for your plan. Please upgrade to add more CNPJs.`
      });
      return;
    }
    
    // Check if CNPJ already exists for this user
    const existingCNPJ = await CNPJ.findOne({
      where: { cnpj, userId }
    });
    
    if (existingCNPJ) {
      res.status(400).json({ message: 'This CNPJ is already registered for your account' });
      return;
    }
    
    // Create new CNPJ
    const newCNPJ = await CNPJ.create({
      cnpj,
      razaoSocial,
      nomeFantasia,
      userId,
      downloadConfig: downloadConfig || undefined
    });
    
    res.status(201).json({
      message: 'CNPJ added successfully',
      cnpj: newCNPJ
    });
  } catch (error) {
    console.error('Error adding CNPJ:', error);
    res.status(500).json({ message: 'Server error while adding CNPJ' });
  }
};

// Update CNPJ
export const updateCNPJ = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const cnpjId = req.params.id;
    const { razaoSocial, nomeFantasia, active, downloadConfig } = req.body;
    
    // Find CNPJ by ID and ensure it belongs to the authenticated user
    const cnpj = await CNPJ.findOne({
      where: { id: cnpjId, userId }
    });
    
    if (!cnpj) {
      res.status(404).json({ message: 'CNPJ not found' });
      return;
    }
    
    // Update CNPJ fields
    if (razaoSocial) cnpj.razaoSocial = razaoSocial;
    if (nomeFantasia) cnpj.nomeFantasia = nomeFantasia;
    if (typeof active === 'boolean') cnpj.active = active;
    if (downloadConfig) cnpj.downloadConfig = downloadConfig;
    
    // Save changes
    await cnpj.save();
    
    res.json({
      message: 'CNPJ updated successfully',
      cnpj
    });
  } catch (error) {
    console.error('Error updating CNPJ:', error);
    res.status(500).json({ message: 'Server error while updating CNPJ' });
  }
};

// Delete CNPJ
export const deleteCNPJ = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const cnpjId = req.params.id;
    
    // Find CNPJ by ID and ensure it belongs to the authenticated user
    const cnpj = await CNPJ.findOne({
      where: { id: cnpjId, userId }
    });
    
    if (!cnpj) {
      res.status(404).json({ message: 'CNPJ not found' });
      return;
    }
    
    // Delete CNPJ
    await cnpj.destroy();
    
    res.json({ message: 'CNPJ deleted successfully' });
  } catch (error) {
    console.error('Error deleting CNPJ:', error);
    res.status(500).json({ message: 'Server error while deleting CNPJ' });
  }
};

// Helper function to get plan details
function getPlanDetails(planName: string) {
  const plans = {
    free: {
      maxCNPJs: 1,
      downloadFrequency: ['1x ao dia'],
      retentionDays: 7
    },
    starter: {
      maxCNPJs: 3,
      downloadFrequency: ['1x ao dia'],
      retentionDays: 7
    },
    professional: {
      maxCNPJs: 10,
      downloadFrequency: ['1x ao dia', '2x ao dia'],
      retentionDays: 30
    },
    enterprise: {
      maxCNPJs: 30,
      downloadFrequency: ['1x ao dia', '2x ao dia', '4x ao dia', 'Personalizado'],
      retentionDays: 90
    }
  };
  
  return plans[planName as keyof typeof plans] || plans.free;
}