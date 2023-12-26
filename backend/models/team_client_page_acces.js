'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team_Client_Page_Acces extends Model {
    static associate(models) {
      Team_Client_Page_Acces.belongsTo(models.Team_User,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      }) 

      Team_Client_Page_Acces.belongsTo(models.Client_Page,{
        foreignKey: 'id_client_page',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Team_Client_Page_Acces.init({
    id_team: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Teams',
        key: 'id',
        as: 'id_team'
      }
    },

    id_client_page: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Client_Pages',
        key: 'id',
        as: 'id_client_page'
      }
    },
  }, {
    sequelize,
    modelName: 'Team_Client_Page_Acces',
  });
  return Team_Client_Page_Acces;
};