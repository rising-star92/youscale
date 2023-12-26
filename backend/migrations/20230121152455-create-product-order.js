'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Product_Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_order: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Orders',
          key: 'id',
          as: 'id_order'
        }
      },
      id_product: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Products',
          key: 'id',
          as: 'id_product'
        }
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      variant:{
        type: Sequelize.JSON
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
    await queryInterface.dropTable('Product_Orders');
  }
};