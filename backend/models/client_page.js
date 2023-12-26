'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client_Page extends Model {
    static associate(models) {
      Client_Page.hasMany(models.Team_Client_Page_Acces,{
        foreignKey: 'id_client_page',
        onDelete: 'CASCADE',
      })
    }
  }
  Client_Page.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Client_Page',
  });
  return Client_Page;
};