'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      SheetId: {
        type: Sequelize.STRING,
        unique: true
      },
      LivoId: {
        type: Sequelize.STRING,
        unique: true,
        defaultValue: null
      },
      telDuplicate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isSendLivo: {
        type: Sequelize.STRING,
        defaultValue: 'not_send',
        allowNull: false
      },
      reportedDate: {
        type: Sequelize.DATE
      },
      nom: {
        type: Sequelize.STRING
      },
      changer: {
        type: Sequelize.STRING
      },
      ouvrir: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      telephone: {
        type: Sequelize.STRING
      },
      id_city: {
        type: Sequelize.INTEGER,
        references:{
          model : 'City_Users',
          key: 'id',
          as: 'id_city'
        }
      },
      prix: {
        type: Sequelize.FLOAT
      },
      status: {
        type: Sequelize.STRING
      },
      adresse: {
        type: Sequelize.STRING
      },
      source: {
        type: Sequelize.STRING
      },
      id_team: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Team_Users',
          key: 'id',
          as: 'id_team'
        }
      },
      id_user: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Users',
          key: 'id',
          as: 'id_user'
        }
      },
      id_setting: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Setting_Users',
          key: 'id',
          as: 'id_setting'
        }
      },
      updownsell: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};