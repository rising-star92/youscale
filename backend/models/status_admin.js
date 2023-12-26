'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Status_Admin extends Model {
    static associate(models) {
      Status_Admin.belongsTo(models.Setting_Admin,{
        foreignKey: 'id_setting',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Status_Admin.init({
    name: DataTypes.STRING,
    checked: DataTypes.BOOLEAN,
    id_setting: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Setting_Admins',
        key: 'id',
        as: 'id_setting'
      }
    }
  }, {
    sequelize,
    modelName: 'Status_Admin',
  });
  return Status_Admin;
};