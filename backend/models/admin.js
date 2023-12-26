'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      Admin.hasMany(models.Coupon,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Admin.hasMany(models.Shipping_Companie,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Admin.hasMany(models.City_Admin,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Admin.hasMany(models.Column_Of_User,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 
      
      Admin.hasMany(models.User,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Admin.hasMany(models.Team_Admin,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Admin.hasMany(models.Setting_Admin,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Admin.hasMany(models.Admin_Gain,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Admin.hasMany(models.Admin_Perte,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Admin.hasMany(models.Admin_Perte_Categorie,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Admin.hasMany(models.Admin_Gain_Categorie,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

    }
  }
  Admin.init({
    email: DataTypes.STRING,
    role: DataTypes.STRING,
    fullname: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Admin',
  });
  return Admin;
};