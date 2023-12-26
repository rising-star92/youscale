'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team_Client_Column_Acces extends Model {
    static associate(models) {
      Team_Client_Column_Acces.belongsTo(models.Team_User,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      }) 

      Team_Client_Column_Acces.belongsTo(models.Column_Of_Order,{
        foreignKey: 'id_column_of_order',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Team_Client_Column_Acces.init({
    id_team: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Teams',
        key: 'id',
        as: 'id_team'
      }
    },

    id_column_of_order: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Column_Of_Orders',
        key: 'id',
        as: 'id_column_of_order'
      }
    },
  }, {
    sequelize,
    modelName: 'Team_Client_Column_Acces',
  });
  return Team_Client_Column_Acces;
};