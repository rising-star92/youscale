'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reference: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      picture: {
        type: Sequelize.STRING,
        unique: true
      },
      fullname: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'client'
      },
      email: {
        type: Sequelize.STRING
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isBeginner: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      step: {
        type: Sequelize.STRING,
        defaultValue: 'question'
      },
      isTrial: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      trialPeriod: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      trialAt: {
        type: Sequelize.DATE,
        defaultValue: 0
      },
      favorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      id_team_member_confirmation: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Team_Admins',
          key: 'id',
          as: 'id_team_member_confirmation'
        }
      },
      telephone: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      },
      livoToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      id_admin_setting: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Setting_Admins',
          key: 'id'
        }
      },
      id_admin: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Admins',
          key: 'id',
          as: 'id_admin'
        }
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
    await queryInterface.dropTable('Users');
  }
};