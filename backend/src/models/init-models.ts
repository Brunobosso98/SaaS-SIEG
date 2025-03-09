import User from './user.model';
import CNPJ from './cnpj.model';

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

  console.log('Model associations initialized successfully');
}