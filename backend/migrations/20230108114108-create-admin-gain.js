'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Admin_Gains', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.FLOAT
      },
      date: {
        type: Sequelize.DATE
      },
      note: {
        type: Sequelize.TEXT
      },
      id_admin: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Admins',
          key: 'id',
          as: 'id_admin'
        }
      },
      id_gain_categorie: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Admin_Gain_Categories',
          key: 'id',
          as: 'id_gain_categorie'
        }
      },
      id_user: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('Admin_Gains');
  }
};