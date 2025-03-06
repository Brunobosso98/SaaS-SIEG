const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');

const CNPJ = sequelize.define('CNPJ', {
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
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['cnpj', 'userId']
    }
  ]
});

// Associations
CNPJ.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(CNPJ, { foreignKey: 'userId', as: 'cnpjs' });

module.exports = CNPJ;