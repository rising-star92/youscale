'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin_Perte extends Model {
    static associate(models) {
      Admin_Perte.belongsTo(models.Admin_Perte_Categorie, {
        foreignKey: 'id_perte_categorie'
      })

      Admin_Perte.belongsTo(models.User, {
        foreignKey: 'id_user'
      })

      Admin_Perte.belongsTo(models.Admin,{
        foreignKey: 'id_admin'
      })
    }
  }
  Admin_Perte.init({
    amount: DataTypes.FLOAT,
    dateFrom: DataTypes.DATE,
    dateTo: DataTypes.DATE,
    note: DataTypes.TEXT,

    id_perte_categorie: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Admin_Perte_Categories',
        key: 'id',
        as: 'id_perte_categorie'
      }
    },
    id_user: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        as: 'id_user'
      }
    },

    id_admin: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references:{
        model : 'Admins',
        key: 'id',
        as: 'id_admin'
      }
    },
  }, {
    sequelize,
    modelName: 'Admin_Perte',
  });
  return Admin_Perte;
};