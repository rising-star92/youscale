'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team_Admin_Client_Acces extends Model {
    static associate(models) {
      Team_Admin_Client_Acces.belongsTo(models.Team_Admin,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      }) 

      Team_Admin_Client_Acces.belongsTo(models.User,{
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Team_Admin_Client_Acces.init({
    id_team: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Team_Admins',
        key: 'id',
        as: 'id_team'
      }
  },
    id_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Users',
        key: 'id',
        as: 'id_user'
      }
  },
  }, {
    sequelize,
    modelName: 'Team_Admin_Client_Acces',
  });
  return Team_Admin_Client_Acces;
};