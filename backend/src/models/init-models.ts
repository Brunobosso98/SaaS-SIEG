import User from './user.model';
import CNPJ from './cnpj.model';
import XML from './xml.model';

// Initialize model associations
export function initializeModels() {
  // User to CNPJ association (one-to-many)
  User.hasMany(CNPJ, {
    sourceKey: 'id',
    foreignKey: 'userId',
    as: 'cnpjs'
  });
  
  // CNPJ to User association (many-to-one)
  CNPJ.belongsTo(User, {
    targetKey: 'id',
    foreignKey: 'userId',
    as: 'user'
  });

  // XML associations
  XML.belongsTo(User, { foreignKey: 'userId', as: 'associatedUser' });
  User.hasMany(XML, { foreignKey: 'userId', as: 'userXMLs' });

  XML.belongsTo(CNPJ, { foreignKey: 'cnpjId', as: 'associatedCnpj' });
  CNPJ.hasMany(XML, { foreignKey: 'cnpjId', as: 'cnpjXMLs' });

  console.log('Model associations initialized successfully');
}
