import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './user.model';

// Define the CNPJ attributes interface
interface CNPJAttributes {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  active: boolean;
  downloadConfig: CNPJDownloadConfig;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the CNPJDownloadConfig interface
interface CNPJDownloadConfig {
  documentTypes: string[];
  directory: string | null;
  schedule: {
    frequency: string;
    times: string[];
  };
}

// Define the attributes for CNPJ creation
interface CNPJCreationAttributes extends Optional<CNPJAttributes, 'id'> {}

// Define the CNPJ model class
class CNPJ extends Model<CNPJAttributes, CNPJCreationAttributes> implements CNPJAttributes {
  public id!: string;
  public cnpj!: string;
  public razaoSocial!: string;
  public nomeFantasia!: string | null;
  public active!: boolean;
  public downloadConfig!: CNPJDownloadConfig;
  public userId!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
}

CNPJ.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    cnpj: {
      type: DataTypes.STRING(14),
      allowNull: false,
      validate: {
        len: [14, 14],
        isNumeric: true
      }
    },
    razaoSocial: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nomeFantasia: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    downloadConfig: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        documentTypes: ['nfe'],
        directory: null, // Uses user's default if null
        schedule: {
          frequency: 'daily',
          times: ['08:00']
        }
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'CNPJ',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['cnpj', 'userId']
      }
    ]
  }
);

// Associations
CNPJ.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(CNPJ, { foreignKey: 'userId', as: 'cnpjs' });

export default CNPJ;