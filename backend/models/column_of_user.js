'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Column_Of_User extends Model {
    static associate(models) {
      Column_Of_User.belongsTo(models.Admin,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 

      Column_Of_User.hasMany(models.Team_Admin_Column_Acces,{
        foreignKey: 'id_column_of_user',
        onDelete: 'CASCADE',
      })
    }
  }
  Column_Of_User.init({
    name: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
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
    modelName: 'Column_Of_User',
  });
  return Column_Of_User;
};