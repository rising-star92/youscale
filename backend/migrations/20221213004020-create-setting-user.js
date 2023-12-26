'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Setting_Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      default_cof_ricing: {
        type: Sequelize.FLOAT
      },
      delfaulnpt_del_pricing: {
        type: Sequelize.FLOAT
      },
      default_time: {
        type: Sequelize.INTEGER
      },
      automated_msg: {
        type: Sequelize.STRING
      },
      startWrldOrder: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Setting_Users');
  }
};