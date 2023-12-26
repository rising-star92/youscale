'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MessageSupport extends Model {
    static associate(models) {
      MessageSupport.belongsTo(models.Support, {
        foreignKey: 'id_support',
        onDelete: 'CASCADE'
      })

      MessageSupport.belongsTo(models.User, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      })
    }
  }
  MessageSupport.init({
    message: DataTypes.STRING,
    id_support: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Support',
        key: 'id',
        as: 'id_support'
      }
    },
    id_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id',
        as: 'id_user'
      }
    },
  }, {
    sequelize,
    modelName: 'MessageSupport',
  });
  return MessageSupport;
};