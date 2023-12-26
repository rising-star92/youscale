'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ads extends Model {
    static associate(models) {
      Ads.belongsTo(models.Setting_Admin,{
        foreignKey: 'id_setting',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Ads.init({
    image: {
      type: DataTypes.BLOB('medium'),
        get () {
          let data = this.getDataValue('image');
          return data ? data.toString() : '';
        }
    },
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
    },
  }, {
    sequelize,
    modelName: 'Ads',
  });
  return Ads;
};