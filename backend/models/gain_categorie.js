'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Gain_Categorie extends Model {
    static associate(models) {
      Gain_Categorie.hasMany(models.Gain,{
        foreignKey: 'id_gain_categorie'
      })
    }
  }
  Gain_Categorie.init({
    name: DataTypes.STRING,
    id_user: {
      type: DataTypes.INTEGER,
      references:{
        model : 'Users',
        key: 'id',
        as: 'id_user'
      }
    }
  }, {
    sequelize,
    modelName: 'Gain_Categorie',
  });
  return Gain_Categorie;
};