'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin_Gain extends Model {
    static associate(models) {
      Admin_Gain.belongsTo(models.Admin_Gain_Categorie, {
        foreignKey: 'id_gain_categorie'
      })

      Admin_Gain.belongsTo(models.User, {
        foreignKey: 'id_user'
      })

      Admin_Gain.belongsTo(models.Admin,{
        foreignKey: 'id_admin'
      })
    }
  }
  Admin_Gain.init({
    amount: DataTypes.FLOAT,
    date: DataTypes.DATE,
    note: DataTypes.TEXT,
    
    id_gain_categorie:  {
      type: DataTypes.INTEGER,
      references:{
        model : 'Admin_Gain_Categories',
        key: 'id',
        as: 'id_gain_categorie'
      }
    },
    id_user: {
      type: DataTypes.INTEGER,
      references:{
        model : 'Users',
        key: 'id',
        as: 'id_user'
      }
    },
    id_admin: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Admins',
        key: 'id',
        as: 'id_admin'
      }
    },
  }, {
    sequelize,
    modelName: 'Admin_Gain',
  });
  return Admin_Gain;
};