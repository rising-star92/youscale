'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order_Audit extends Model {
    static associate(models) {
      Order_Audit.belongsTo(models.Order, {foreignKey: 'id_order'});
    }
  }
  Order_Audit.init({
    id_order: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Order_Audit',
  });
  return Order_Audit;
};