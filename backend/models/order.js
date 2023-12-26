'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // define association here

      Order.belongsTo(models.City_User, {
        foreignKey: 'id_city',
        onDelete: 'CASCADE'
      });

      Order.belongsTo(models.Team_User, {
        foreignKey: 'id_team',
        onDelete: 'CASCADE'
      });

      Order.hasMany(models.Product_Order, {
        foreignKey: 'id_order',
        onDelete: 'CASCADE'
      });

      Order.hasMany(models.Order_Comment, {
        foreignKey: 'id_order',
        onDelete: 'CASCADE'
      });

      Order.belongsTo(models.User, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE'
      });

      Order.hasMany(models.Order_Audit, {
        foreignKey: 'id_order',
        onDelete: 'CASCADE'
      });

      Order.belongsTo(models.Setting_User, {
        foreignKey: 'id_setting',
        onDelete: 'CASCADE'
      });
    }
  }
  Order.init({
    date: DataTypes.DATE,
    SheetId: {
      type: DataTypes.STRING,
      unique: true
    },
    LivoId: {
      type: DataTypes.STRING,
      unique: true,
      defaultValue: null
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    telDuplicate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isSendLivo: {
      type: DataTypes.STRING,
      defaultValue: 'not_send',
      allowNull: false
    },
    reportedDate: DataTypes.DATE,
    nom: DataTypes.STRING,
    telephone: DataTypes.STRING,
    id_city: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'City_Users',
        key: 'id'
      }
    },
    prix: DataTypes.FLOAT,
    status: DataTypes.STRING,
    adresse: DataTypes.STRING,
    changer: DataTypes.STRING,
    ouvrir: DataTypes.STRING,
    message: DataTypes.STRING,
    source: DataTypes.STRING,
    updownsell: DataTypes.STRING,
    id_team: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Team_Users',
        key: 'id'
      }
    },
    id_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    id_setting: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Setting_Users',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};