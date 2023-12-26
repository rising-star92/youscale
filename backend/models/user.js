'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Admin,{
        foreignKey: 'id_admin',
      }) 

      User.belongsTo(models.Team_Admin,{
        as: 'id_team_member_confirmationTeamAdmin',
        foreignKey: {
          name: 'id_team_member_confirmation'
        }
      }) 

      User.belongsTo(models.Setting_Admin, {
        foreignKey: 'id_admin_setting',
        onDelete: 'CASCADE'
      })

      User.hasMany(models.Support,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.MessageSupport,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Column_Of_Order,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Subscription,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Status_User,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Product,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Stock,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.City_User,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Team_User,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Team_Admin_Client_Acces,{
        foreignKey: 'id_user',
      })

      User.hasMany(models.Gain,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Perte,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Sheet,{
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      }) 

      User.hasMany(models.Admin_Gain,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Admin_Perte,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Discount,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Order,{
        foreignKey: 'id_user',
      })

      User.hasMany(models.Client_Account,{
        foreignKey: 'id_user',
      })

      User.hasMany(models.Client_Payment,{
        foreignKey: 'id_user',
      })

      User.hasMany(models.Client_Goal,{
        foreignKey: 'id_user',
      })

      User.hasMany(models.Setting_User,{
        foreignKey: 'id_user',
      }) 

      User.hasMany(models.Client_Response,{
        foreignKey: 'id_user',
      })
    }
  }
  User.init({
    picture:  {
      type: DataTypes.STRING,
      defaultValue: null
    },
    reference: DataTypes.STRING,
    fullname: DataTypes.STRING,
    message: DataTypes.STRING,
    role: DataTypes.STRING,
    email: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    favorite: DataTypes.BOOLEAN,
    step: DataTypes.BOOLEAN,
    isBeginner: DataTypes.BOOLEAN,
    isTrial: DataTypes.BOOLEAN,
    trialPeriod: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    trialAt: {
      type: DataTypes.DATE,
      defaultValue: 0
    },
    telephone: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    livoToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_admin: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references:{
        model : 'Admins',
        key: 'id',
        as: 'id_admin'
      }
    },
    id_admin_setting: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Setting_Admins',
        key: 'id'
      }
    },
    id_team_member_confirmation: {
      type: DataTypes.INTEGER,
      references:{
        model : 'Team_Admins',
        key: 'id',
        as: 'id_team_member_confirmation'
      }
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};