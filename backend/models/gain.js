'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Gain extends Model {
    static associate(models) {
      Gain.belongsTo(models.Gain_Categorie,{
        foreignKey: 'id_gain_categorie'
      })

      Gain.belongsTo(models.Product,{
        foreignKey: 'id_product'
      })

      Gain.belongsTo(models.User,{
        foreignKey: 'id_user'
      })
    }
  }
  Gain.init({
    amount: DataTypes.FLOAT,
    dateFrom: DataTypes.DATE,
    dateTo: DataTypes.DATE,
    note: DataTypes.TEXT,
    id_gain_categorie: {
      type: DataTypes.INTEGER,
      references:{
        model : 'Gains',
        key: 'id',
        as: 'id_gain_categorie'
      }
    },
    id_product: {
      type: DataTypes.INTEGER,
      references:{
        model : 'Products',
        key: 'id',
        as: 'id_product'
      }
    },
    id_user: {
      type: DataTypes.INTEGER,
      references:{
        model : 'Users',
        key: 'id',
        as: 'id_user'
      }
    }
  }, {
    sequelize,
    modelName: 'Gain',
  });
  return Gain;
};