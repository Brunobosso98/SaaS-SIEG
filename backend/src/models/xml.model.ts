import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './user.model';
import CNPJ from './cnpj.model';

// Define the XML attributes interface
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
  cnpjId: string;
  userId: string;
  expiryDate: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the attributes for XML creation
type XMLCreationAttributes = Optional<XMLAttributes, 'id' | 'downloadDate'>;

// Define the XML model class
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
  public cnpjId!: string;
  public userId!: string;
  public expiryDate!: Date | null;
  public metadata!: Record<string, unknown> | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
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
      defaultValue: DataTypes.NOW
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
    cnpjId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cnpjs',
        key: 'id'
      }
    },
    userId: {
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
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['cnpjId']
      },
      {
        fields: ['documentType']
      },
      {
        fields: ['downloadDate']
      }
    ]
  }
);

// Associations
XML.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(XML, { foreignKey: 'userId', as: 'xmls' });

XML.belongsTo(CNPJ, { foreignKey: 'cnpjId', as: 'cnpj' });
CNPJ.hasMany(XML, { foreignKey: 'cnpjId', as: 'xmls' });

export default XML;