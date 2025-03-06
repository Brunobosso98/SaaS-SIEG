const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');
const CNPJ = require('./cnpj.model');

const XML = sequelize.define('XML', {
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
}, {
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
});

// Associations
XML.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(XML, { foreignKey: 'userId', as: 'xmls' });

XML.belongsTo(CNPJ, { foreignKey: 'cnpjId', as: 'cnpj' });
CNPJ.hasMany(XML, { foreignKey: 'cnpjId', as: 'xmls' });

module.exports = XML;