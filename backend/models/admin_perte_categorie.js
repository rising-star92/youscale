'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin_Perte_Categorie extends Model {
    static associate(models) {
      Admin_Perte_Categorie.hasMany(models.Admin_Gain,{
        foreignKey: 'id_gain_categorie'
      })

      Admin_Perte_Categorie.hasMany(models.Admin_Perte,{
        foreignKey: 'id_perte_categorie'
      })

      Admin_Perte_Categorie.belongsTo(models.Admin,{
        foreignKey: 'id_admin'
      })
    }
  }
  Admin_Perte_Categorie.init({
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
    modelName: 'Admin_Perte_Categorie',
  });
  return Admin_Perte_Categorie;
};