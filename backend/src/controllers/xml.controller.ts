import { Request, Response } from 'express';
import XML from '../models/xml.model';
import CNPJ from '../models/cnpj.model';
import User from '../models/user.model';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';

// Define request types
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

interface DownloadXMLRequest extends AuthenticatedRequest {
  body: {
    cnpjId: string;
    documentTypes?: string[];
    startDate?: string;
    endDate?: string;
  };
}

interface GetXMLHistoryRequest extends AuthenticatedRequest {
  query: {
    cnpjId?: string;
    documentType?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: string;
    limit?: string;
  };
}

interface ConfigureXMLDownloadSettingsRequest extends AuthenticatedRequest {
  body: {
    documentTypes?: string[];
    directory?: string;
    retention?: number;
    schedule?: {
      frequency: string;
      times?: string[];
    };
  };
}

// Download XML files
export const downloadXML = async (req: DownloadXMLRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { cnpjId, documentTypes, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!cnpjId) {
      res.status(400).json({ message: 'CNPJ ID is required' });
      return;
    }
    
    // Check if CNPJ belongs to user
    const cnpj = await CNPJ.findOne({
      where: { id: cnpjId, userId }
    });
    
    if (!cnpj) {
      res.status(404).json({ message: 'CNPJ not found' });
      return;
    }
    
    // Get user for SIEG key and settings
    const user = await User.findByPk(userId);
    
    if (!user || !user.siegKey) {
      res.status(400).json({ message: 'SIEG key is required. Please add your SIEG key in settings.' });
      return;
    }
    
    // In a real app, this would call the SIEG API to download XML files
    // For now, we'll simulate a successful download
    
    // Create a record of the download
    const xml = await XML.create({
      fileName: `example_${Date.now()}.xml`,
      filePath: `/downloads/${userId}/${cnpjId}/example.xml`,
      fileSize: 1024, // Example size in bytes
      documentType: documentTypes?.[0] || 'nfe',
      documentNumber: '12345',
      documentDate: new Date(),
      downloadDate: new Date(),
      status: 'success',
      downloadType: 'manual',
      cnpjId,
      userId,
      expiryDate: new Date(Date.now() + (user.settings.downloadConfig.retention * 24 * 60 * 60 * 1000)), // Based on retention days
      metadata: {
        requestParams: { documentTypes, startDate, endDate }
      }
    });
    
    res.json({
      message: 'XML download initiated successfully',
      xml: {
        id: xml.id,
        fileName: xml.fileName,
        documentType: xml.documentType,
        status: xml.status,
        downloadDate: xml.downloadDate
      }
    });
  } catch (error) {
    console.error('Error downloading XML:', error);
    res.status(500).json({ message: 'Server error while downloading XML' });
  }
};

// Get XML download history
export const getXMLHistory = async (req: GetXMLHistoryRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { 
      cnpjId, 
      documentType, 
      startDate, 
      endDate, 
      status, 
      page = '1', 
      limit = '10' 
    } = req.query;
    
    // Build query filters
    const filters: any = { userId };
    if (cnpjId) filters.cnpjId = cnpjId;
    if (documentType) filters.documentType = documentType;
    if (status) filters.status = status;
    
    // Date filters
    if (startDate && endDate) {
      filters.downloadDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      filters.downloadDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      filters.downloadDate = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Get XML history with pagination
    const { count, rows } = await XML.findAndCountAll({
      where: filters,
      limit: limitNum,
      offset,
      order: [['downloadDate', 'DESC']],
      include: [{
        model: CNPJ,
        as: 'cnpj',
        attributes: ['cnpj', 'razaoSocial']
      }]
    });
    
    res.json({
      total: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      xmls: rows
    });
  } catch (error) {
    console.error('Error fetching XML history:', error);
    res.status(500).json({ message: 'Server error while fetching XML history' });
  }
};

// Get XML by ID
export const getXMLById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const xmlId = req.params.id;
    
    // Find XML by ID and ensure it belongs to the authenticated user
    const xml = await XML.findOne({
      where: { id: xmlId, userId },
      include: [{
        model: CNPJ,
        as: 'cnpj',
        attributes: ['cnpj', 'razaoSocial']
      }]
    });
    
    if (!xml) {
      res.status(404).json({ message: 'XML not found' });
      return;
    }
    
    res.json(xml);
  } catch (error) {
    console.error('Error fetching XML:', error);
    res.status(500).json({ message: 'Server error while fetching XML' });
  }
};

// Delete XML
export const deleteXML = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const xmlId = req.params.id;
    
    // Find XML by ID and ensure it belongs to the authenticated user
    const xml = await XML.findOne({
      where: { id: xmlId, userId }
    });
    
    if (!xml) {
      res.status(404).json({ message: 'XML not found' });
      return;
    }
    
    // In a real app, you would also delete the file from storage
    // For now, we'll just delete the database record
    await xml.destroy();
    
    res.json({ message: 'XML deleted successfully' });
  } catch (error) {
    console.error('Error deleting XML:', error);
    res.status(500).json({ message: 'Server error while deleting XML' });
  }
};

// View XML content
export const viewXML = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const xmlId = req.params.id;
    
    // Find XML by ID and ensure it belongs to the authenticated user
    const xml = await XML.findOne({
      where: { id: xmlId, userId }
    });
    
    if (!xml) {
      res.status(404).json({ message: 'XML not found' });
      return;
    }
    
    // In a real app, you would read the file from storage and return its content
    // For now, we'll return a mock XML content
    const mockXMLContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe versao="4.00" Id="NFe${xml.documentNumber}">
      <ide>
        <cUF>35</cUF>
        <cNF>12345678</cNF>
        <natOp>Venda</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>${xml.documentNumber}</nNF>
        <dhEmi>${xml.documentDate?.toISOString()}</dhEmi>
      </ide>
      <emit>
        <CNPJ>${xml.cnpj ? xml.cnpj.cnpj : '00000000000000'}</CNPJ>
        <xNome>${xml.cnpj ? xml.cnpj.razaoSocial : 'Empresa Exemplo'}</xNome>
      </emit>
    </infNFe>
  </NFe>
</nfeProc>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(mockXMLContent);
  } catch (error) {
    console.error('Error viewing XML:', error);
    res.status(500).json({ message: 'Server error while viewing XML' });
  }
};

// Configure XML download settings
export const configureXMLDownloadSettings = async (req: ConfigureXMLDownloadSettingsRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { documentTypes, directory, retention, schedule } = req.body;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update settings
    const updatedSettings = { ...user.settings };
    
    if (documentTypes) {
      updatedSettings.documentTypes = documentTypes;
    }
    
    if (directory || retention) {
      updatedSettings.downloadConfig = { ...updatedSettings.downloadConfig };
      if (directory) updatedSettings.downloadConfig.directory = directory;
      if (retention) updatedSettings.downloadConfig.retention = retention;
    }
    
    if (schedule) {
      // Check if user's plan allows the requested schedule
      const planDetails = getPlanDetails(user.plan);
      const requestedFrequency = schedule.frequency;
      
      if (!planDetails.downloadFrequency.includes(requestedFrequency)) {
        res.status(403).json({
          message: `Your current plan does not support ${requestedFrequency} download frequency. Please upgrade your plan.`
        });
        return;
      }
      
      updatedSettings.schedule = schedule;
    }
    
    // Save updated settings
    user.settings = updatedSettings;
    await user.save();
    
    res.json({
      message: 'XML download settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Error updating XML download settings:', error);
    res.status(500).json({ message: 'Server error while updating XML download settings' });
  }
};

// Helper function to get plan details
interface PlanDetails {
  maxCNPJs: number;
  downloadFrequency: string[];
  retentionDays: number;
}

function getPlanDetails(planName: string): PlanDetails {
  const plans: Record<string, PlanDetails> = {
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