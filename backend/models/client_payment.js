'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client_Payment extends Model {
    static associate(models) {
      Client_Payment.belongsTo(models.User, {
        onDelete: 'CASCADE',
        foreignKey: 'id_user'
      });
    }
  }
  Client_Payment.init({
    amount: DataTypes.FLOAT,
    status: DataTypes.STRING,
    image: {
      type: DataTypes.BLOB('medium'),
        get () {
          let data = this.getDataValue('image');
          return data ? data.toString() : '';
        }
    },
    id_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'User',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Client_Payment',
  });
  return Client_Payment;
};