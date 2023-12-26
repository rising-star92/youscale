'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin_Page extends Model {
    static associate(models) {
      Admin_Page.hasMany(models.Team_Admin_Page_Acces,{
        foreignKey: 'id_admin_page',
        onDelete: 'CASCADE',
      })
    }
  }
  Admin_Page.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Admin_Page',
  });
  return Admin_Page;
};