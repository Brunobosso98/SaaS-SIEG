import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './user.model';
import CNPJ from './cnpj.model';

interface XMLAttributes {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  documentType: string;
  documentNumber: string | null;
  documentDate: Date | null;
  downloadDate: Date;
  status: 'success' | 'failed' | 'processing';
  errorMessage: string | null;
  downloadType: 'automatic' | 'manual';
  cnpj_id: string;
  user_id: string;
  expiryDate: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type XMLCreationAttributes = Optional<XMLAttributes, 'id' | 'downloadDate'>;

class XML extends Model<XMLAttributes, XMLCreationAttributes> implements XMLAttributes {
  public id!: string;
  public fileName!: string;
  public filePath!: string;
  public fileSize!: number;
  public documentType!: string;
  public documentNumber!: string | null;
  public documentDate!: Date | null;
  public downloadDate!: Date;
  public status!: 'success' | 'failed' | 'processing';
  public errorMessage!: string | null;
  public downloadType!: 'automatic' | 'manual';
  public cnpj_id!: string;
  public user_id!: string;
  public expiryDate!: Date | null;
  public metadata!: Record<string, unknown> | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly owner?: User;
  public readonly cnpj?: CNPJ;
}

XML.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'document_type', // Enforce snake_case column name
      validate: {
        isIn: [['nfe', 'nfce', 'cte', 'mdfe', 'nfse']]
      }
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    documentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    downloadDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'download_date' // Enforce snake_case column name
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'processing'),
      allowNull: false,
      defaultValue: 'success'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    downloadType: {
      type: DataTypes.ENUM('automatic', 'manual'),
      allowNull: false,
      defaultValue: 'automatic'
    },
    cnpj_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cnpjs',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'XML',
    tableName: 'xmls', // Explicitly set table name to avoid pluralization issues
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['cnpj_id']
      },
      {
        fields: ['document_type'], // Use snake_case here
        name: 'xmls_document_type' // Explicitly name the index
      },
      {
        fields: ['download_date'],
        name: 'xmls_download_date'
      }
    ]
  }
);

export default XML;
