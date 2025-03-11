import User from './user.model';
import CNPJ from './cnpj.model';
import XML from './xml.model';

export function initializeModels(): void {
  // User -> CNPJ associations
  User.hasMany(CNPJ, {
    sourceKey: 'id',
    foreignKey: 'userId',
    as: 'cnpjs'
  });

  CNPJ.belongsTo(User, {
    targetKey: 'id',
    foreignKey: 'userId',
    as: 'owner'
  });

  // User -> XML associations
  User.hasMany(XML, {
    foreignKey: 'user_id',
    as: 'xmls'
  });

  XML.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'owner'
  });

  // CNPJ -> XML associations
  CNPJ.hasMany(XML, {
    foreignKey: 'cnpj_id',
    as: 'documents'
  });

  XML.belongsTo(CNPJ, {
    foreignKey: 'cnpj_id',
    as: 'cnpj'
  });
}
