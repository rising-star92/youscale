'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Variant extends Model {
    static associate(models) {
      // define association here
      Variant.belongsTo(models.User, {foreignKey: 'id_user'})
    }
  }
  Variant.init({
    name: DataTypes.STRING,
    id_user: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Variant',
  });
  return Variant;
};