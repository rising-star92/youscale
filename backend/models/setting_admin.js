'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting_Admin extends Model {
    static associate(models) {

      Setting_Admin.hasMany(models.Status_Admin,{
        foreignKey: 'id_setting',
        onDelete: 'CASCADE',
      }) 

      Setting_Admin.hasMany(models.Annoucement,{
        foreignKey: 'id_setting',
        onDelete: 'CASCADE',
      }) 

      Setting_Admin.hasMany(models.Ads,{
        foreignKey: 'id_setting',
        onDelete: 'CASCADE',
      }) 

      Setting_Admin.hasMany(models.User, {
        foreignKey: 'id_admin_setting',
        onDelete: 'CASCADE'
      })

      Setting_Admin.belongsTo(models.Admin,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

    }
  }
  Setting_Admin.init({
    default_conf_pricing: DataTypes.FLOAT,
    delfault_del_pricing: DataTypes.FLOAT,
    default_time: DataTypes.INTEGER,
    trial_period: DataTypes.INTEGER,
    automated_msg: DataTypes.STRING,
    max_solde_du:{
      type: DataTypes.FLOAT,
      defaultValue: 10000.99
    },
    goal:{
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    id_admin: {
        type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Admins',
          key: 'id',
          as: 'id_admin'
        }
    }
  }, {
    sequelize,
    modelName: 'Setting_Admin',
  });
  return Setting_Admin;
};