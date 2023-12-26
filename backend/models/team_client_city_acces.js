'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team_Client_City_Acces extends Model {
    static associate(models) {
      Team_Client_City_Acces.belongsTo(models.Team_User,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      }) 

      Team_Client_City_Acces.belongsTo(models.City_User,{
        foreignKey: 'id_city',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Team_Client_City_Acces.init({
    id_team: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Teams',
        key: 'id',
        as: 'id_team'
      }
    },

    id_city: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'City_Users',
        key: 'id',
        as: 'id_city'
      }
    },
  }, {
    sequelize,
    modelName: 'Team_Client_City_Acces',
  });
  return Team_Client_City_Acces;
};