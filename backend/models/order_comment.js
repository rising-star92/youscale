'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order_Comment extends Model {
    static associate(models) {
      // define association here
      Order_Comment.belongsTo(models.Order, {
        foreignKey: 'id_order',
        onDelete: 'CASCADE'
      });
    }
  }
  
  Order_Comment.init({
    message: DataTypes.STRING,
    id_order: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'Order_Comment',
  });
  return Order_Comment;
};