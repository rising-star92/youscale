'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Other_Charge extends Model {
    static associate(models) {
      Other_Charge.belongsTo(models.Product,{
        foreignKey: 'id_product',
        onDelete: 'CASCADE',
      })
    }
  }
  Other_Charge.init({
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    id_product: {
      type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Products',
          key: 'id',
          as: 'id_product'
        }
    }
  }, {
    sequelize,
    modelName: 'Other_Charge',
  });
  return Other_Charge;
};