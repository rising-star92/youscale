'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City_User extends Model {
    static associate(models) {
      City_User.belongsTo(models.User, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      })

      City_User.belongsTo(models.Shipping_Companie, {
        foreignKey: 'id_shipping',
        onDelete: 'CASCADE',
      })

      City_User.hasMany(models.Stock, {
        foreignKey: 'id_city',
        onDelete: 'CASCADE',
      })

      City_User.hasMany(models.Team_Client_City_Acces, {
        foreignKey: 'id_city',
        onDelete: 'CASCADE',
      })

      City_User.hasMany(models.Order, {
        foreignKey: 'id_city',
        onDelete: 'CASCADE',
      })
    }
  }
  City_User.init({
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    isFromSheet: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    id_shipping: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Shipping_Companies',
        key: 'id',
        as: 'id_shipping'
      }
    }
  }, {
    sequelize,
    modelName: 'City_User',
  });
  return City_User;
};