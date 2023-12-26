'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Team_Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      livoToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isHidden: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      password: {
        type: Sequelize.STRING
      },
      salaire: {
        type: Sequelize.FLOAT
      },
      day_payment: {
        type: Sequelize.INTEGER
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      commission: {
        type: Sequelize.FLOAT
      },
      upsell: {
        type: Sequelize.FLOAT
      },
      downsell: {
        type: Sequelize.FLOAT
      },
      crosssell: {
        type: Sequelize.FLOAT
      },
      max_order: {
        type: Sequelize.INTEGER
      },
      nb_order: {
        type: Sequelize.INTEGER
      },
      can_delete_order: {
        type: Sequelize.BOOLEAN
      },
      can_edit_order: {
        type: Sequelize.BOOLEAN
      },
      all_column_access: {
        type: Sequelize.BOOLEAN
      },
      all_cities_access: {
        type: Sequelize.BOOLEAN
      },
      all_product_access: {
        type: Sequelize.BOOLEAN
      },
      all_page_access: {
        type: Sequelize.BOOLEAN
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
      desactive_at: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null
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
    await queryInterface.dropTable('Team_Users');
  }
};