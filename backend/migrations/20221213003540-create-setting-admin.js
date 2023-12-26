'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Setting_Admins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      default_conf_pricing: {
        type: Sequelize.FLOAT
      },
      delfault_del_pricing: {
        type: Sequelize.FLOAT
      },
      default_time: {
        type: Sequelize.INTEGER
      },
      trial_period: {
        type: Sequelize.INTEGER
      },
      automated_msg: {
        type: Sequelize.STRING
      },
      max_solde_du: {
        type: Sequelize.FLOAT,
        defaultValue: 10000.99
      },
      goal:{
        type: Sequelize.FLOAT,
        defaultValue: 0
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
    await queryInterface.dropTable('Setting_Admins');
  }
};