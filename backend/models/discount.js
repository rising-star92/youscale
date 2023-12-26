'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Discount extends Model {
    static associate(models) {
      Discount.belongsTo(models.User,{
        foreignKey: 'id_user',
      }) 

      Discount.belongsTo(models.Coupon,{
        foreignKey: 'id_coupon',
      }) 
    }
  }

  Discount.init({
    id_coupon: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Coupons',
        key: 'id',
        as: 'id_coupon'
      }
    },
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
    modelName: 'Discount',
  });
  return Discount;
};