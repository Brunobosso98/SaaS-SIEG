const CNPJ = require('../models/cnpj.model');
const User = require('../models/user.model');

// Get all CNPJs for the authenticated user
exports.getAllCNPJs = async (req, res) => {
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
exports.getCNPJById = async (req, res) => {
  try {
    const userId = req.user.id;
    const cnpjId = req.params.id;
    
    // Find CNPJ by ID and ensure it belongs to the authenticated user
    const cnpj = await CNPJ.findOne({
      where: { id: cnpjId, userId },
      attributes: ['id', 'cnpj', 'razaoSocial', 'nomeFantasia', 'active', 'downloadConfig', 'createdAt', 'updatedAt']
    });
    
    if (!cnpj) {
      return res.status(404).json({ message: 'CNPJ not found' });
    }
    
    res.json(cnpj);
  } catch (error) {
    console.error('Error fetching CNPJ:', error);
    res.status(500).json({ message: 'Server error while fetching CNPJ' });
  }
};

// Add new CNPJ
exports.addCNPJ = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cnpj, razaoSocial, nomeFantasia, downloadConfig } = req.body;
    
    // Validate CNPJ format
    if (!cnpj || cnpj.length !== 14 || !/^\d+$/.test(cnpj)) {
      return res.status(400).json({ message: 'Invalid CNPJ format. Must be 14 digits.' });
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
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get plan details to check CNPJ limit
    const planDetails = getPlanDetails(user.plan);
    const currentCNPJCount = user.cnpjs ? user.cnpjs.length : 0;
    
    if (currentCNPJCount >= planDetails.maxCNPJs) {
      return res.status(403).json({
        message: `You have reached the maximum number of CNPJs (${planDetails.maxCNPJs}) allowed for your plan. Please upgrade to add more CNPJs.`
      });
    }
    
    // Check if CNPJ already exists for this user
    const existingCNPJ = await CNPJ.findOne({
      where: { cnpj, userId }
    });
    
    if (existingCNPJ) {
      return res.status(400).json({ message: 'This CNPJ is already registered for your account' });
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
      cnpj: {
        id: newCNPJ.id,
        cnpj: newCNPJ.cnpj,
        razaoSocial: newCNPJ.razaoSocial,
        nomeFantasia: newCNPJ.nomeFantasia,
        active: newCNPJ.active,
        downloadConfig: newCNPJ.downloadConfig
      }
    });
  } catch (error) {
    console.error('Error adding CNPJ:', error);
    res.status(500).json({ message: 'Server error while adding CNPJ' });
  }
};

// Update CNPJ
exports.updateCNPJ = async (req, res) => {
  try {
    const userId = req.user.id;
    const cnpjId = req.params.id;
    const { razaoSocial, nomeFantasia, active, downloadConfig } = req.body;
    
    // Find CNPJ by ID and ensure it belongs to the authenticated user
    const cnpj = await CNPJ.findOne({
      where: { id: cnpjId, userId }
    });
    
    if (!cnpj) {
      return res.status(404).json({ message: 'CNPJ not found' });
    }
    
    // Update CNPJ fields
    if (razaoSocial !== undefined) cnpj.razaoSocial = razaoSocial;
    if (nomeFantasia !== undefined) cnpj.nomeFantasia = nomeFantasia;
    if (active !== undefined) cnpj.active = active;
    if (downloadConfig) {
      // Merge existing config with new config
      cnpj.downloadConfig = { ...cnpj.downloadConfig, ...downloadConfig };
    }
    
    // Save changes
    await cnpj.save();
    
    res.json({
      message: 'CNPJ updated successfully',
      cnpj: {
        id: cnpj.id,
        cnpj: cnpj.cnpj,
        razaoSocial: cnpj.razaoSocial,
        nomeFantasia: cnpj.nomeFantasia,
        active: cnpj.active,
        downloadConfig: cnpj.downloadConfig
      }
    });
  } catch (error) {
    console.error('Error updating CNPJ:', error);
    res.status(500).json({ message: 'Server error while updating CNPJ' });
  }
};

// Delete CNPJ
exports.deleteCNPJ = async (req, res) => {
  try {
    const userId = req.user.id;
    const cnpjId = req.params.id;
    
    // Find CNPJ by ID and ensure it belongs to the authenticated user
    const cnpj = await CNPJ.findOne({
      where: { id: cnpjId, userId }
    });
    
    if (!cnpj) {
      return res.status(404).json({ message: 'CNPJ not found' });
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
function getPlanDetails(planName) {
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
  
  return plans[planName] || plans.free;
}