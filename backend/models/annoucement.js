'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Annoucement extends Model {
    static associate(models) {
      Annoucement.belongsTo(models.Setting_Admin,{
        foreignKey: 'id_setting',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Annoucement.init({
    text: DataTypes.STRING,
    id_setting: {
        type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Setting_Admins',
          key: 'id',
          as: 'id_setting'
        }
    },
    clt_categorie: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Annoucement',
  });
  return Annoucement;
};