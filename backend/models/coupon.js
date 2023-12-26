'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.belongsTo(models.Admin, {
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      })

      Coupon.hasMany(models.Discount, {
        foreignKey: 'id_coupon',
        onDelete: 'CASCADE',
      })
    }
  }
  Coupon.init({
    is_valid: DataTypes.BOOLEAN,
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    discount: DataTypes.FLOAT,
    time: DataTypes.STRING,
    limit: DataTypes.INTEGER,
    used: DataTypes.INTEGER,
    client_used: DataTypes.JSON,
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
    modelName: 'Coupon',
  });
  return Coupon;
};