'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client_Account extends Model {
    static associate(models) {
      Client_Account.belongsTo(models.User, {
        onDelete: 'CASCADE',
        foreignKey: 'id_user'
      });
    }
  }
  Client_Account.init({
    solde: DataTypes.FLOAT,
    montant_du: DataTypes.FLOAT,
    id_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'User',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Client_Account',
  });
  return Client_Account;
};