'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pack extends Model {
    static associate(models) {
      Pack.hasMany(models.Subscription,{
        foreignKey: 'id_pack',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Pack.init({
    name: DataTypes.STRING,
    support: DataTypes.STRING,
    isShow: DataTypes.BOOLEAN,
    price_per_month: DataTypes.FLOAT,
    item_inclued: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Pack',
  });
  return Pack;
};