'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bank_Information extends Model {
    static associate(models) {

      Bank_Information.hasMany(models.Payment_Method, {
        onDelete: 'CASCADE',
        foreignKey: 'id_bank_informations'
      });
      
    }
  }
  Bank_Information.init({
    name: DataTypes.STRING,
    bank: DataTypes.STRING,
    rib: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Bank_Information',
  });
  return Bank_Information;
};