import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';
import CNPJ from './cnpj.model';

// Define the User attributes interface
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  verified: boolean;
  verificationToken: string | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  siegKey: string | null;
  settings: UserSettings;
  cnpjs?: CNPJ[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the UserSettings interface
interface UserSettings {
  documentTypes: string[];
  downloadConfig: {
    directory: string;
    retention: number; // days
  };
  notifications: {
    email: boolean;
    downloadComplete: boolean;
    downloadFailed: boolean;
  };
  schedule?: {
    frequency: string;
    times: string[];
  };
}

// Define the attributes for User creation
type UserCreationAttributes = Optional<UserAttributes, 'id'>;

// Define the User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public verified!: boolean;
  public verificationToken!: string | null;
  public resetToken!: string | null;
  public resetTokenExpiry!: Date | null;
  public plan!: 'free' | 'starter' | 'professional' | 'enterprise';
  public siegKey!: string | null;
  public settings!: UserSettings;
  public cnpjs?: CNPJ[];
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  // Instance method to check password
  public async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    plan: {
      type: DataTypes.ENUM('free', 'starter', 'professional', 'enterprise'),
      defaultValue: 'free'
    },
    siegKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        documentTypes: [],
        downloadConfig: {
          directory: 'downloads',
          retention: 7
        },
        notifications: {
          email: true,
          downloadComplete: true,
          downloadFailed: true
        }
      }
    }
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user: User) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

export default User;

// Define associations
export const defineAssociations = (CNPJ: typeof import('./cnpj.model').default) => {
  User.hasMany(CNPJ, {
    sourceKey: 'id',
    foreignKey: 'userId',
    as: 'cnpjs'
  });
};