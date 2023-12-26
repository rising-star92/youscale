'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting_User extends Model {
    static associate(models) {
      Setting_User.belongsTo(models.User,{
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      })

      Setting_User.hasMany(models.Order, {
        foreignKey: 'id_setting',
        onDelete: 'CASCADE'
      });
    }
  }
  Setting_User.init({
    default_cof_ricing: DataTypes.FLOAT,
    delfaulnpt_del_pricing: DataTypes.FLOAT,
    default_time: DataTypes.INTEGER,
    automated_msg: DataTypes.STRING,
    startWrldOrder: DataTypes.STRING,
    id_user: {
        type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Users',
          key: 'id',
          as: 'id_user'
        }
    }
  }, {
    sequelize,
    modelName: 'Setting_User',
  });
  return Setting_User;
};