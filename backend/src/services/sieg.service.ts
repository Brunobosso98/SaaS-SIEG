import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { Op } from 'sequelize';
import User from '../models/user.model';
import CNPJ from '../models/cnpj.model';
import XML from '../models/xml.model';
import { createHash } from 'crypto';

// Define interface for XML data
interface XmlData {
  ano: string;
  mes: string;
  cnpjEmit: string;
  numeroNota: string | null;
  tipoNota: string;
  docType: string;
  dataEmissao: string;
  xmlHash?: string; // Optional property for XML hash
}

interface DocTypeConfig {
  xmlType: number;
  baseDir: string;
  namespace: string;
  numeroTag: string;
  tipoTag: string;
  tipoMap: Record<string, string>;
}

// Document type configurations
const DOC_TYPES: Record<string, DocTypeConfig> = {
  'nfe': {
    xmlType: 1,
    baseDir: 'NFE',
    namespace: 'http://www.portalfiscal.inf.br/nfe',
    numeroTag: 'nNF',
    tipoTag: 'tpNF',
    tipoMap: { '0': 'entrada', '1': 'saida' }
  },
  'cte': {
    xmlType: 2,
    baseDir: 'CTE',
    namespace: 'http://www.portalfiscal.inf.br/cte',
    numeroTag: 'cCT',
    tipoTag: 'tpCTe',
    tipoMap: { '0': 'entrada', '1': 'saida' }
  },
  'nfse': {
    xmlType: 3, // Same as NFe but with different identification
    baseDir: 'NFSE',
    namespace: 'http://www.portalfiscal.inf.br/nfse',
    numeroTag: 'nNF',
    tipoTag: 'tpNF',
    tipoMap: { '0': 'entrada', '1': 'saida' }
  },
  'nfce': {
    xmlType: 4, // Same as NFe but with different identification
    baseDir: 'NFCE',
    namespace: 'http://www.portalfiscal.inf.br/nfce',
    numeroTag: 'nNF',
    tipoTag: 'tpNF',
    tipoMap: { '0': 'entrada', '1': 'saida' }
  },
  'cfe': {
    xmlType: 5, // Same as NFe but with different identification
    baseDir: 'cfe',
    namespace: 'http://www.portalfiscal.inf.br/cfe',
    numeroTag: 'nNF',
    tipoTag: 'tpNF',
    tipoMap: { '0': 'entrada', '1': 'saida' }
  }
};

// Month names for folder organization
const MESES: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Marco', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
};

class SiegService {
  /**
   * Makes a request to the SIEG API to get XML documents
   */
  private async makeApiRequest(siegKey: string, cnpj: string, date: string, xmlType: number, skip = 0, maxRetries = 5, retryDelay = 5000) {
    // Ensure siegKey is properly defined before using it
    if (!siegKey || siegKey.trim() === '') {
      console.error('❌ SIEG API key is empty or undefined');
      return null;
    }
    
    // Check if the API key is already URL-encoded and use it directly if it is
    // This prevents double-encoding issues where %2f becomes %252f
    const apiKey = siegKey.trim();
    const url = `https://api.sieg.com/BaixarXmlsV2?api_key=${apiKey}`;
    const headers = { 'Content-Type': 'application/json' };
    const payload = {
      XmlType: xmlType,
      Take: 50, // Maximum 50 XMLs per request
      Skip: skip,
      DataEmissaoInicio: date,
      DataEmissaoFim: date,
      CnpjEmit: cnpj,
      Downloadevent: false
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Log URL components separately to diagnose the issue
        console.info(`🔄 Making API request to SIEG API for CNPJ ${cnpj}, date ${date}, xmlType ${xmlType}, skip ${skip}`);
        console.info(`🔑 Using SIEG API Key: ${siegKey ? siegKey.substring(0, 3) + '...' + siegKey.substring(siegKey.length - 3) : 'undefined'}`);
        console.info(`🔗 Full URL being used: ${url}`);
        console.info(`📦 Request payload: ${JSON.stringify(payload)}`);
        const response = await axios.post(url, payload, { headers });
        return response;
      } catch (error: unknown) {
        // If it's a 404 with "No XML file found" message, return it as it's not an error
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
          const errorData = error.response.data;
          if (Array.isArray(errorData) && errorData.length > 0 &&
              errorData[0].includes('Nenhum arquivo XML localizado')) {
            return error.response;
          }
        }

        // Log detailed error information
        console.error(`❌ API request failed (Attempt ${attempt + 1}/${maxRetries}):`);
        console.error(`🔑 API Key used: ${siegKey.substring(0, 3)}...${siegKey.substring(siegKey.length - 3)}`);

        if (axios.isAxiosError(error) && error.response) {
          // The request was made and the server responded with a status code outside of 2xx range
          console.error(`📊 Status: ${error.response.status}`);
          console.error(`📋 Status Text: ${error.response.statusText}`);
          console.error(`🧩 Headers: ${JSON.stringify(error.response.headers)}`);
          console.error(`📄 Response data: ${JSON.stringify(error.response.data)}`);
        } else if (axios.isAxiosError(error) && error.request) {
          // The request was made but no response was received
          console.error('📭 No response received from server');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error(`🔧 Error setting up request: ${error instanceof Error ? error.message : String(error)}`);
        }

        // If it's the last attempt, return null
        if (attempt === maxRetries - 1) {
          console.error(`❌ All attempts failed for CNPJ ${cnpj} on date ${date}. Continuing with next...`);
          return null;
        }

        // Otherwise, wait and retry
        console.warn(`⚠️ Attempt ${attempt + 1} of ${maxRetries} failed. Status: ${axios.isAxiosError(error) && error.response?.status || 'Network Error'}`);
        console.info(`🔄 Waiting ${retryDelay / 1000} seconds before retrying...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    return null;
  }

  /**
   * Extracts relevant data from XML content
   */
  private async extractXmlData(xmlContent: string, docType: string): Promise<XmlData | null> {
    try {
      const result = await parseStringPromise(xmlContent, { explicitArray: false });
      const docConfig = DOC_TYPES[docType];
      
      // Extract the root element based on document type
      let root;
      if (docType === 'nfe' || docType === 'nfce') {
        root = result.nfeProc?.NFe || result.NFe;
      } else if (docType === 'cte') {
        root = result.cteProc?.CTe || result.CTe;
      }

      if (!root) {
        throw new Error('Unable to find root element in XML');
      }

      // Extract issue date
      const infDoc = docType === 'cte' ? root.infCte : root.infNFe;
      const ide = infDoc.ide;
      const dhEmi = ide.dhEmi || ide.dEmi;
      const dataEmissao = dhEmi ? dhEmi.substring(0, 10) : '0000-00-00';
      const [ano, mes] = dataEmissao.split('-');

      // Extract issuer CNPJ
      const emit = infDoc.emit;
      const cnpjEmit = emit.CNPJ || '00000000000000';

      // Extract document number
      const numeroDoc = ide[docConfig.numeroTag] || null;

      // Extract document type (input/output)
      const tipoDoc = ide[docConfig.tipoTag];
      const tipoNota = docConfig.tipoMap[tipoDoc || '1'] || 'saida';

      return {
        ano,
        mes,
        cnpjEmit,
        numeroNota: numeroDoc,
        tipoNota,
        docType,
        dataEmissao
      };
    } catch (error) {
      console.error(`❌ Error extracting data from XML: ${error}`);
      return null;
    }
  }

  /**
   * Saves XML file to disk in the appropriate folder structure
   */
  private async saveXmlFile(xmlContent: string, xmlData: XmlData, userId: string, cnpj_id: string, downloadType: 'automatic' | 'manual') {
    try {
      // Get user settings for base directory
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      const docConfig = DOC_TYPES[xmlData.docType];
      const mesNome = MESES[xmlData.mes] || xmlData.mes;
      
      // Determine base directory from user settings or use default
      const baseDir = user.settings?.downloadConfig?.directory || path.join(process.cwd(), 'downloads');
      
      // Create full directory path
      const dirPath = path.join(
        baseDir,
        docConfig.baseDir,
        xmlData.tipoNota,
        xmlData.ano,
        mesNome,
        xmlData.cnpjEmit
      );

      // Create directory if it doesn't exist
      fs.mkdirSync(dirPath, { recursive: true });

      // Create file name and path
      const fileName = `${xmlData.numeroNota || 'unknown'}.xml`;
      const filePath = path.join(dirPath, fileName);

      // Write XML content to file
      fs.writeFileSync(filePath, xmlContent, 'utf8');

      // Get file size
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Calculate expiry date based on user's retention setting
      const retentionDays = user.settings?.downloadConfig?.retention || 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + retentionDays);

      // Create XML record in database
      await XML.create({
        fileName,
        filePath,
        fileSize,
        documentType: xmlData.docType,
        documentNumber: xmlData.numeroNota,
        documentDate: new Date(xmlData.dataEmissao),
        downloadDate: new Date(),
        status: 'success',
        errorMessage: null,
        downloadType,
        cnpj_id,
        user_id: userId,
        expiryDate: expiryDate,
        metadata: xmlData as unknown as Record<string, unknown>
      });

      return filePath;
    } catch (error) {
      console.error(`❌ Error saving XML file: ${error}`);

      // Create failed record in database
      await XML.create({
        fileName: `${xmlData.numeroNota || 'unknown'}.xml`,
        filePath: '',
        fileSize: 0,
        documentType: xmlData.docType,
        documentNumber: xmlData.numeroNota,
        documentDate: xmlData.dataEmissao ? new Date(xmlData.dataEmissao) : null,
        downloadDate: new Date(),
        status: 'failed',
        errorMessage: `Error saving file: ${error}`,
        downloadType,
        cnpj_id,
        user_id: userId,
        expiryDate: new Date(), // Default expiry date in case of error
        metadata: xmlData as unknown as Record<string, unknown>
      });

      return null;
    }
  }

  /**
   * Checks if XML has already been downloaded
   */
  private async isXmlAlreadyDownloaded(xmlHash: string, cnpjId: string, documentNumber: string | null) {
    // Check by document number if available
    if (documentNumber) {
      const existingByNumber = await XML.findOne({
        where: {
          cnpj_id: cnpjId,
          documentNumber,
          status: 'success'
        }
      });

      if (existingByNumber) {
        return true;
      }
    }

    // Check by metadata hash (stored in metadata field)
    const existingByHash = await XML.findOne({
      where: {
        cnpj_id: cnpjId,
        metadata: {
          xmlHash
        },
        status: 'success'
      }
    });

    return !!existingByHash;
  }

  /**
   * Process XMLs for a specific CNPJ and date
   */
  private async processXmlsForCnpjAndDate(userId: string, cnpjRecord: CNPJ, docType: string, date: string, downloadType: 'automatic' | 'manual') {
    if (!cnpjRecord) {
      console.error(`❌ CNPJ record is undefined`);
      return { success: false, message: 'CNPJ record is undefined' };
    }
    const user = await User.findByPk(userId);
    if (!user || !user.siegKey) {
      console.error(`❌ User ${userId} has no SIEG API key configured`);
      return { success: false, message: 'No SIEG API key configured' };
    }

    const docConfig = DOC_TYPES[docType];
    if (!docConfig) {
      console.error(`❌ Invalid document type: ${docType}`);
      return { success: false, message: 'Invalid document type' };
    }

    console.info(`📅 Fetching ${docType.toUpperCase()} for CNPJ ${cnpjRecord.cnpj} on date ${date}`);

    // Initialize variables for pagination
    let skip = 0;
    let hasMoreXmls = true;
    let totalProcessed = 0;
    let totalNew = 0;

    while (hasMoreXmls) {
      // Make API request
      const response = await this.makeApiRequest(
        user.siegKey,
        cnpjRecord.cnpj,
        date,
        docConfig.xmlType,
        skip
      );

      // If response is null, all retries failed
      if (!response) {
        hasMoreXmls = false;
        continue;
      }

      if (response.status === 200) {
        try {
          const data = response.data;
          console.info(`🔹 Processing response for CNPJ ${cnpjRecord.cnpj} on date ${date} (Skip: ${skip})`);

          if (data.xmls && Array.isArray(data.xmls) && data.xmls.length > 0) {
            for (const xmlBase64 of data.xmls) {
              totalProcessed++;
              
              // Decode XML content
              const xmlContent = Buffer.from(xmlBase64, 'base64').toString('utf8');
              
              // Extract data from XML
              const xmlData = await this.extractXmlData(xmlContent, docType);
              if (!xmlData) {
                console.warn(`⚠️ Could not extract data from XML. Skipping...`);
                continue;
              }

              // Generate hash for XML content to check for duplicates
              const xmlHash = createHash('md5').update(xmlBase64).digest('hex');
              xmlData.xmlHash = xmlHash;

              // Check if XML has already been downloaded
              const alreadyDownloaded = await this.isXmlAlreadyDownloaded(xmlHash, cnpjRecord.id, xmlData.numeroNota);
              if (alreadyDownloaded) {
                console.warn(`⚠️ XML ${xmlData.numeroNota || 'unknown'} already downloaded. Skipping...`);
                continue;
              }

              // Save XML file
              const filePath = await this.saveXmlFile(xmlContent, xmlData, userId, cnpjRecord.id, downloadType);
              if (filePath) {
                totalNew++;
                console.info(`✅ XML ${xmlData.numeroNota || 'unknown'} saved to: ${filePath}`);
              }
            }

            // Check if there are more XMLs to fetch
            if (data.xmls.length === 50) {
              skip += 50;
              // Wait between requests to respect API rate limits
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              hasMoreXmls = false;
            }
          } else {
            console.warn(`⚠️ No XMLs returned by API for CNPJ ${cnpjRecord.cnpj} on date ${date}`);
            hasMoreXmls = false;
          }
        } catch (error) {
          console.error(`❌ Error processing response: ${error}`);
          hasMoreXmls = false;
        }
      } else {
        console.warn(`⚠️ API returned status ${response.status} for CNPJ ${cnpjRecord.cnpj} on date ${date}`);
        hasMoreXmls = false;
      }
      
      // Wait between requests to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return {
      success: true,
      totalProcessed,
      totalNew,
      message: `Processed ${totalProcessed} XMLs, downloaded ${totalNew} new XMLs`
    };
  }

  /**
   * Download XMLs for a specific CNPJ for a date range
   */
  public async downloadXmlsForCnpj(userId: string, cnpjId: string, documentTypes: string[], startDate: string, endDate: string, downloadType: 'automatic' | 'manual' = 'manual') {
    try {
      // Get CNPJ record
      const cnpjRecord = await CNPJ.findOne({
        where: {
          id: cnpjId,
          userId,
          active: true
        }
      });

      if (!cnpjRecord) {
        return { success: false, message: 'CNPJ not found or not active' };
      }

      // Generate dates between start and end dates
      const dates: string[] = [];
      const currentDate = new Date(startDate);
      const lastDate = new Date(endDate);

      while (currentDate <= lastDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Process each document type for each date
      const results = [];
      for (const docType of documentTypes) {
        if (!DOC_TYPES[docType]) {
          console.warn(`⚠️ Skipping invalid document type: ${docType}`);
          continue;
        }

        for (const date of dates) {
          const result = await this.processXmlsForCnpjAndDate(userId, cnpjRecord, docType, date, downloadType);
          results.push({
            cnpj: cnpjRecord.cnpj,
            date,
            docType,
            ...result
          });
        }
      }

      return {
        success: true,
        results,
        message: `Completed XML download for CNPJ ${cnpjRecord.cnpj}`
      };
    } catch (error) {
      console.error(`❌ Error downloading XMLs for CNPJ ${cnpjId}: ${error}`);
      return { success: false, message: `Error: ${error}` };
    }
  }

  /**
   * Download XMLs for all active CNPJs of a user
   */
  public async downloadXmlsForUser(userId: string, documentTypes: string[] = [], days: number = 5, downloadType: 'automatic' | 'manual' = 'automatic') {
    try {
      // Get user record
      const user = await User.findByPk(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Get all active CNPJs for the user
      const cnpjs = await CNPJ.findAll({
        where: {
          userId,
          active: true
        }
      });

      if (cnpjs.length === 0) {
        return { success: false, message: 'No active CNPJs found for user' };
      }

      // Use document types from user settings if not provided
      if (!documentTypes || documentTypes.length === 0) {
        documentTypes = user.settings?.documentTypes || ['nfe'];
      }

      // Calculate date range (today - days to today)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Process each CNPJ
      const results = [];
      for (const cnpj of cnpjs) {
        const result = await this.downloadXmlsForCnpj(
          userId,
          cnpj.id,
          documentTypes,
          startDateStr,
          endDateStr,
          downloadType
        );
        results.push({
          cnpj: cnpj.cnpj,
          ...result
        });
      }

      return {
        success: true,
        results,
        message: `Completed XML download for ${cnpjs.length} CNPJs`
      };
    } catch (error) {
      console.error(`❌ Error downloading XMLs for user ${userId}: ${error}`);
      return { success: false, message: `Error: ${error}` };
    }
  }

  /**
   * Clean up expired XML records
   */
  public async cleanupExpiredXmls() {
    try {
      const now = new Date();
      
      // Find expired XML records
      const expiredXmls = await XML.findAll({
        where: {
          expiryDate: {
            [Op.lt]: now
          }
        }
      });

      if (expiredXmls.length === 0) {
        return { success: true, message: 'No expired XMLs found' };
      }

      // Delete files and records
      let deletedCount = 0;
      for (const xml of expiredXmls) {
        try {
          // Delete file if it exists
          if (xml.filePath && fs.existsSync(xml.filePath)) {
            fs.unlinkSync(xml.filePath);
          }
          
          // Delete record
          await xml.destroy();
          deletedCount++;
        } catch (error) {
          console.error(`❌ Error deleting XML ${xml.id}: ${error}`);
        }
      }

      return {
        success: true,
        deletedCount,
        message: `Deleted ${deletedCount} expired XML records`
      };
    } catch (error) {
      console.error(`❌ Error cleaning up expired XMLs: ${error}`);
      return { success: false, message: `Error: ${error}` };
    }
  }
}

export default new SiegService();
