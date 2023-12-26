'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Status_User extends Model {
    static associate(models) {
      Status_User.belongsTo(models.User,{
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      })
    }
  }
  Status_User.init({
    name: DataTypes.STRING,
    checked: DataTypes.BOOLEAN,
    color: DataTypes.STRING,
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
    modelName: 'Status_User',
  });
  return Status_User;
};