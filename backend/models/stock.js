'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) {
      Stock.belongsTo(models.User,{
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      })

      Stock.belongsTo(models.Product,{
        foreignKey: 'id_product',
        onDelete: 'CASCADE',
      })

      Stock.belongsTo(models.City_User,{
        foreignKey: 'id_city',
        onDelete: 'CASCADE',
      })
    }
  }
  Stock.init({
    quantity: DataTypes.INTEGER,
    id_user: {
        type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Users',
          key: 'id',
          as: 'id_user'
        }
    },
    id_product: {
        type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Products',
          key: 'id',
          as: 'id_product'
        }
    },
    id_city: {
        type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'City_Users',
          key: 'id',
          as: 'id_city'
        }
    }
  }, {
    sequelize,
    modelName: 'Stock',
  });
  return Stock;
};