'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Shipping_Companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      isShow: {
        type: Sequelize.BOOLEAN
      },
      range: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      mode_pricing: {
        type: Sequelize.ENUM,
        values: ['cmd_total', 'cmd_livre', 'prix_fixe'],
        defaultValue: 'cmd_total'
      },
      value: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      image: {
        type: Sequelize.BLOB('medium')
      },
      id_admin: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Admins',
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
    await queryInterface.dropTable('Shipping_Companies');
  }
};