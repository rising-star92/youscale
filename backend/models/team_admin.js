'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team_Admin extends Model {
    static associate(models) {

      Team_Admin.hasMany(models.User,{
        as: 'id_team_member_confirmationTeamAdmin',
        foreignKey: {
          name: 'id_team_member_confirmation'
        },
      }) 

      Team_Admin.hasMany(models.Team_Admin_Column_Acces,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      })
      
      Team_Admin.hasMany(models.Team_Admin_Client_Acces,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      })

      Team_Admin.hasMany(models.Team_Admin_Page_Acces,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      })

      Team_Admin.belongsTo(models.Admin,{
        foreignKey: 'id_admin',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Team_Admin.init({
    active: DataTypes.BOOLEAN,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    salaire: DataTypes.FLOAT,
    day_payment: DataTypes.INTEGER,
    commission: DataTypes.FLOAT,
    upsell: DataTypes.FLOAT,
    crosssell: DataTypes.FLOAT,
    downsell: DataTypes.FLOAT,
    max_order: DataTypes.INTEGER,
    nb_order: DataTypes.INTEGER,
    can_del_or_edit_order: DataTypes.BOOLEAN,
    all_column_access: DataTypes.BOOLEAN,
    all_client_access: DataTypes.BOOLEAN,
    all_page_access: DataTypes.BOOLEAN,
    id_admin: {
        type: DataTypes.INTEGER,
        references:{
          model : 'Admins',
          key: 'id',
          as: 'id_admin'
        }
    }
  }, {
    sequelize,
    modelName: 'Team_Admin',
  });
  return Team_Admin;
};