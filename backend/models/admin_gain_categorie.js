'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin_Gain_Categorie extends Model {
    static associate(models) {
      Admin_Gain_Categorie.hasMany(models.Admin_Gain,{
        foreignKey: 'id_gain_categorie'
      })

      Admin_Gain_Categorie.belongsTo(models.Admin,{
        foreignKey: 'id_admin'
      })
    }
  }
  Admin_Gain_Categorie.init({
    id_admin: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Admins',
        key: 'id',
        as: 'id_admin'
      }
    },
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Admin_Gain_Categorie',
  });
  return Admin_Gain_Categorie;
};