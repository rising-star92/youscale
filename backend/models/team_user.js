 'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team_User extends Model {
    static associate(models) {
      Team_User.hasMany(models.Team_Client_Page_Acces,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      })
      
      Team_User.hasMany(models.Team_Client_City_Acces,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      })

      Team_User.hasMany(models.Team_Client_Column_Acces,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      })

      Team_User.hasMany(models.Team_Client_Product_Acces,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      })

      Team_User.belongsTo(models.User,{
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      })

      Team_User.hasMany(models.Order,{
        foreignKey: 'id_team',
        onDelete: 'CASCADE',
      })
    }
  }
  Team_User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    livoToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: DataTypes.STRING,
    salaire: DataTypes.FLOAT,
    day_payment: DataTypes.INTEGER,
    commission: DataTypes.FLOAT,
    upsell: DataTypes.FLOAT,
    downsell: DataTypes.FLOAT,
    crosssell: DataTypes.FLOAT,
    max_order: DataTypes.INTEGER,
    nb_order: DataTypes.INTEGER,
    desactive_at: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: null
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    can_delete_order: DataTypes.BOOLEAN,
    can_edit_order: DataTypes.BOOLEAN,
    all_column_access: DataTypes.BOOLEAN,
    all_cities_access: DataTypes.BOOLEAN,
    all_product_access: DataTypes.BOOLEAN,
    all_page_access: DataTypes.BOOLEAN,
    id_user: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Users',
        key: 'id',
        as: 'id_user'
      }
    }
  }, {
    sequelize,
    modelName: 'Team_User',
  });
  return Team_User;
};