'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.Pack,{
        foreignKey: 'id_pack',
        onDelete: 'CASCADE',
      }) 

      Subscription.belongsTo(models.User,{
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
      }) 
    }
  }
  Subscription.init({
    id_pack: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
        references:{
          model : 'Packs',
          key: 'id',
          as: 'id_pack'
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
    date_subscription: DataTypes.DATE,
    date_expiration: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Subscription',
  });
  return Subscription;
};