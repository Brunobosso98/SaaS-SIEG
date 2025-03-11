import { Request, Response } from 'express';
import XML from '../models/xml.model';
import CNPJ from '../models/cnpj.model';
import User from '../models/user.model';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { executeXmlDownload } from '../scripts/scheduled-xml-download';
import SiegService from '../services/sieg.service';

// Define request types
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
    name?: string;
    plan?: string;
    settings?: {
      documentTypes?: string[];
      downloadConfig?: {
        directory?: string;
        retention?: number;
      };
      schedule?: {
        frequency: string;
        times?: string[];
      };
    };
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
    
    // Use document types from request or user settings
    const docTypes = documentTypes && documentTypes.length > 0 
      ? documentTypes 
      : user.settings?.documentTypes || ['nfe'];
    
    // Use date range from request or default (5 days)
    const today = new Date();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    const startDateToUse = startDate || fiveDaysAgo.toISOString().split('T')[0];
    const endDateToUse = endDate || today.toISOString().split('T')[0];
    
    // Estimate completion time (roughly 1 minute per CNPJ per document type)
    const estimatedMinutes = docTypes.length * 1;
    const estimatedCompletion = new Date(Date.now() + (estimatedMinutes * 60 * 1000));
    
    // Create a job ID for tracking
    const jobId = `xml-download-${userId}-${Date.now()}`;
    
    // Start the download process asynchronously
    setTimeout(async () => {
      try {
        await SiegService.downloadXmlsForCnpj(
          userId,
          cnpjId,
          docTypes,
          startDateToUse,
          endDateToUse,
          'manual'
        );
      } catch (error) {
        console.error(`Error in background XML download for job ${jobId}:`, error);
      }
    }, 0);
    
    // Return immediate response with job ID and estimated completion time
    res.json({
      message: 'XML download initiated',
      jobId,
      estimatedCompletion,
      details: {
        cnpj: cnpj.cnpj,
        documentTypes: docTypes,
        startDate: startDateToUse,
        endDate: endDateToUse
      }
    });
  } catch (error) {
    console.error('Error initiating XML download:', error);
    res.status(500).json({ message: 'Server error while initiating XML download' });
  }
};

// Execute XML download for a specific user (manual trigger)
export const executeUserXmlDownload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Execute the download
    const result = await executeXmlDownload(userId);
    
    if (result.success) {
      res.json({
        message: 'XML download executed successfully',
        details: result
      });
    } else {
      res.status(400).json({
        message: 'XML download failed',
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error executing XML download:', error);
    res.status(500).json({ message: 'Server error while executing XML download' });
  }
};

// Get XML download status
export const getXmlDownloadStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // In a real implementation, this would check the status of a background job
    // For now, we'll return a mock status
    res.json({
      status: 'completed',
      progress: 100,
      message: 'XML download completed successfully',
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking XML download status:', error);
    res.status(500).json({ message: 'Server error while checking XML download status' });
  }
};

// Create a record of the download (example for reference)
const createXmlRecord = async (userId: string, cnpjId: string, documentType: string, startDate?: string, endDate?: string, res?: Response) => {
  try {
    // Get user for settings
    const user = await User.findByPk(userId);
    
    if (!user) {
      if (res) res.status(404).json({ message: 'User not found' });
      return null;
    }
    
    const retentionDays = user.settings?.downloadConfig?.retention || 30;
    
    const xml = await XML.create({
      fileName: `example_${Date.now()}.xml`,
      filePath: `/downloads/${userId}/${cnpjId}/example.xml`,
      fileSize: 1024, // Example size in bytes
      documentType: documentType?.[0] || 'nfe',
      documentNumber: '12345',
      documentDate: new Date(),
      downloadDate: new Date(),
      status: 'success',
      downloadType: 'manual',
      cnpj_id: cnpjId,
      user_id: userId,
      expiryDate: new Date(Date.now() + (retentionDays * 24 * 60 * 60 * 1000)), // Based on retention days
      metadata: {
        requestParams: { documentType, startDate, endDate }
      }
    });
    
    if (res) {
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
    }
    
    return xml;
  } catch (error) {
    console.error('Error downloading XML:', error);
    if (res) res.status(500).json({ message: 'Server error while downloading XML' });
    return null;
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
    const filters: { [key: string]: string | Date | { [Op.between]: Date[] } | { [Op.gte]: Date } | { [Op.lte]: Date } } = { userId };
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
      where: { id: xmlId, user_id: userId },
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
      where: { id: xmlId, user_id: userId }
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
      where: { id: xmlId, user_id: userId },
      include: [{
        model: CNPJ,
        as: 'cnpj',
        attributes: ['cnpj']
      }]
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
      
      // Ensure times array is always defined
      const updatedSchedule = {
        frequency: schedule.frequency,
        times: schedule.times || []
      };
      
      updatedSettings.schedule = updatedSchedule;
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
