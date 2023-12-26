'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team_Admin_Page_Acces extends Model {
    static associate(models) {
      Team_Admin_Page_Acces.belongsTo(models.Team_Admin,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      }) 

      Team_Admin_Page_Acces.belongsTo(models.Admin_Page,{
        foreignKey: 'id_admin_page',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Team_Admin_Page_Acces.init({
    id_team: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Team_Admins',
        key: 'id',
        as: 'id_team'
      }
    },

    id_admin_page: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Admin_Pages',
        key: 'id',
        as: 'id_admin_page'
      }
    },
  }, {
    sequelize,
    modelName: 'Team_Admin_Page_Acces',
  });
  return Team_Admin_Page_Acces;
};