'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Perte extends Model {
    static associate(models) {
      Perte.belongsTo(models.Perte_Categorie,{
        foreignKey: 'id_perte_categorie'
      })

      Perte.belongsTo(models.Product,{
        foreignKey: 'id_product'
      })

      Perte.belongsTo(models.User,{
        foreignKey: 'id_user'
      })
    }
  }
  Perte.init({
    amount: DataTypes.FLOAT,
    dateFrom: DataTypes.DATE,
    dateTo: DataTypes.DATE,
    note: DataTypes.TEXT,
    id_perte_categorie: {
      type: DataTypes.INTEGER,
      references:{
        model : 'Pertes',
        key: 'id',
        as: 'id_perte_categorie'
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
    modelName: 'Perte',
  });
  return Perte;
};