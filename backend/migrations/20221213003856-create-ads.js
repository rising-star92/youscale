'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.BLOB('medium')
      },
      id_setting: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Setting_Admins',
          key: 'id',
          as: 'id_setting'
        }
      },
      clt_categorie: {
        type: Sequelize.JSON,
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('Ads');
  }
};