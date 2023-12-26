'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.User, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      })

      Product.hasMany(models.Stock, {
        foreignKey: 'id_product',
        onDelete: 'CASCADE',
      })

      Product.hasMany(models.Team_Client_Product_Acces, {
        foreignKey: 'id_product',
        onDelete: 'CASCADE',
      })

      Product.hasMany(models.Other_Charge, {
        foreignKey: 'id_product',
        onDelete: 'CASCADE',
      })

      Product.hasMany(models.Product_Order, {
        foreignKey: 'id_product',
        onDelete: 'CASCADE',
      })
    }
  }
  Product.init({
    name: DataTypes.STRING,
    variant: DataTypes.JSON,
    price_selling: DataTypes.FLOAT,
    price_buying: DataTypes.FLOAT,
    price_best_selling: DataTypes.FLOAT,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    id_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id',
        as: 'id_user'
      }
    }
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};