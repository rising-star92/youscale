'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product_Order extends Model {
    static associate(models) {
      // define association here

      Product_Order.belongsTo(models.Order, {
        foreignKey: 'id_order',
        onDelete: 'CASCADE'
      });

      Product_Order.belongsTo(models.Product, {
        foreignKey: 'id_product',
        onDelete: 'CASCADE'
      });
    }
  }
  Product_Order.init({
    id_order: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    id_product: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: DataTypes.INTEGER,
    variant: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Product_Order',
  });
  return Product_Order;
};