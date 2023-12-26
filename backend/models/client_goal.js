'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client_Goal extends Model {
    static associate(models) {
      // define association here
      Client_Goal.belongsTo(models.User, {foreignKey: 'id_user'})
    }
  }
  Client_Goal.init({
    value: DataTypes.FLOAT,
    id_user: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Client_Goal',
  });
  return Client_Goal;
};