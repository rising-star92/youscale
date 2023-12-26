'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Perte_Categorie extends Model {
    static associate(models) {
      Perte_Categorie.hasMany(models.Perte,{
        foreignKey: 'id_perte_categorie'
      })
    }
  }
  Perte_Categorie.init({
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
    modelName: 'Perte_Categorie',
  });
  return Perte_Categorie;
};