'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sheet extends Model {
    static associate(models) {
      Sheet.belongsTo(models.User,{
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Sheet.init({
    SheetID: {
      type: DataTypes.STRING,
      unique: true
    },
    name: DataTypes.STRING,
    range_: DataTypes.STRING,
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
    modelName: 'Sheet',
  });
  return Sheet;
};