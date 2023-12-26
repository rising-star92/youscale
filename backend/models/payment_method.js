'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment_Method extends Model {
    static associate(models) {
      Payment_Method.belongsTo(models.Admin,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Payment_Method.belongsTo(models.Bank_Information, {
        foreignKey: 'id_bank_informations',
        onDelete: 'CASCADE'
      });
    }
  }
  Payment_Method.init({
    name: DataTypes.STRING,
    image: {
      type: DataTypes.BLOB('medium'),
        get () {
          let data = this.getDataValue('image');
          return data ? data.toString() : '';
        }
    },
    id_admin: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
        references:{
          model : 'Admins',
          key: 'id',
          as: 'id_admin'
        }
    },

    id_bank_informations: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Bank_Information',
        key: 'id',
        as: 'id_bank_informations'
      }
    }
  }, {
    sequelize,
    modelName: 'Payment_Method',
  });
  return Payment_Method;
};