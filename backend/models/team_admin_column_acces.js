'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team_Admin_Column_Acces extends Model {
    static associate(models) {
      Team_Admin_Column_Acces.belongsTo(models.Team_Admin,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      }) 

      Team_Admin_Column_Acces.belongsTo(models.Column_Of_User,{
        foreignKey: 'id_column_of_user',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Team_Admin_Column_Acces.init({
    id_team: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Team_Admins',
        key: 'id',
        as: 'id_team'
      }
    },
    
    id_column_of_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Column_Of_Users',
        key: 'id',
        as: 'id_column_of_user'
      }
    },
  }, {
    sequelize,
    modelName: 'Team_Admin_Column_Acces',
  });
  return Team_Admin_Column_Acces;
};