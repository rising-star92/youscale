'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City_Admin extends Model {
    static associate(models) {
      City_Admin.belongsTo(models.Admin,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      })
    }
  }
  City_Admin.init({
    name: DataTypes.STRING,
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
    modelName: 'City_Admin',
  });
  return City_Admin;
};