'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shipping_Companie extends Model {
    static associate(models) {
      Shipping_Companie.belongsTo(models.Admin,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      })

      Shipping_Companie.hasMany(models.City_User,{
        foreignKey: 'id_shipping',
        onDelete: 'CASCADE',
      })
    }
  }
  Shipping_Companie.init({
    name: DataTypes.STRING,
    isShow: DataTypes.BOOLEAN,
    range: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    mode_pricing: {
      type: DataTypes.ENUM,
      values: ['cmd_total', 'cmd_livre', 'prix_fixe'],
      defaultValue: 'cmd_total'
    },
    value: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0
    },
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
    }
  }, {
    sequelize,
    modelName: 'Shipping_Companie',
  });
  return Shipping_Companie;
};