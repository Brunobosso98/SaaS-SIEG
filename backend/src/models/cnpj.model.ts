import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './user.model';

// Define the CNPJ attributes interface
interface CNPJAttributes {
  id: string;
  cnpj: string;
  active: boolean;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the attributes for CNPJ creation
type CNPJCreationAttributes = Optional<CNPJAttributes, 'id'>

// Define the CNPJ model class
class CNPJ extends Model<CNPJAttributes, CNPJCreationAttributes> implements CNPJAttributes {
  public id!: string;
  public cnpj!: string;
  public active!: boolean;
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
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'CNPJ',
    tableName: 'cnpjs',
    timestamps: true,
    underscored: true
  }
);

export default CNPJ;
