'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team_Client_Product_Acces extends Model {
    static associate(models) {
      Team_Client_Product_Acces.belongsTo(models.Team_User,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      }) 

      Team_Client_Product_Acces.belongsTo(models.Product,{
        foreignKey: 'id_product',
        onDelete: 'CASCADE',
      }) 
    }
  }
  
  Team_Client_Product_Acces.init({
    id_team: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Teams',
        key: 'id',
        as: 'id_team'
      }
    },

    id_product: {
        type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Products',
          key: 'id',
          as: 'id_product'
        }
    },
  }, {
    sequelize,
    modelName: 'Team_Client_Product_Acces',
  });
  return Team_Client_Product_Acces;
};