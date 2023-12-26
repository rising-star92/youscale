'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Support extends Model {
    static associate(models) {
      Support.belongsTo(models.User, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      })

      Support.belongsTo(models.Team_Admin, {
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      })

      Support.hasMany(models.MessageSupport, {
        foreignKey: 'id_support',
        onDelete: 'CASCADE'
      })
    }
  }
  Support.init({
    subject: DataTypes.STRING,
    attachment: {
      type: DataTypes.BLOB('medium'),
      get() {
        let data = this.getDataValue('attachment');
        return data ? data.toString() : '';
      }
    },
    description: DataTypes.STRING,
    status: DataTypes.STRING,
    id_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id',
        as: 'id_user'
      }
    },
    id_team: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Team_Admins',
        key: 'id',
        as: 'id_team'
      }
    }
  }, {
    sequelize,
    modelName: 'Support',
  });
  return Support;
};