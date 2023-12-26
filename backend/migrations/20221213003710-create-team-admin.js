'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Team_Admins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
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
      commission: {
        type: Sequelize.FLOAT
      },
      upsell: {
        type: Sequelize.FLOAT
      },
      crosssell: {
        type: Sequelize.FLOAT
      },
      downsell: {
        type: Sequelize.FLOAT
      },
      max_order: {
        type: Sequelize.INTEGER
      },
      nb_order: {
        type: Sequelize.INTEGER
      },
      can_del_or_edit_order: {
        type: Sequelize.BOOLEAN
      },
      all_column_access: {
        type: Sequelize.BOOLEAN
      },
      all_client_access: {
        type: Sequelize.BOOLEAN
      },
      all_page_access: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('Team_Admins');
  }
};