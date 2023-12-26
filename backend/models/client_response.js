'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client_Response extends Model {
    static associate(models) {
      Client_Response.belongsTo(models.User, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      })
    }
  }
  Client_Response.init({
    response: DataTypes.JSON,
    id_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id',
        as: 'id_user'
      }
    }
  }, {
    sequelize,
    modelName: 'Client_Response',
  });
  return Client_Response;
};