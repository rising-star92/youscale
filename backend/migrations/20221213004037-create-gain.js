'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Gains', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.FLOAT
      },
      dateFrom: {
        type: Sequelize.DATE
      },
      dateTo: {
        type: Sequelize.DATE
      },
      note: {
        type: Sequelize.TEXT
      },
      id_gain_categorie: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Gain_Categories',
          key: 'id',
          as: 'id_gain_categorie'
        }
      },
      id_product: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Products',
          key: 'id',
          as: 'id_product'
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
    await queryInterface.dropTable('Gains');
  }
};