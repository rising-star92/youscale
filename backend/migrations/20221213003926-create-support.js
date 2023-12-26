'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Supports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subject: {
        type: Sequelize.STRING
      },
      attachment: {
        type: Sequelize.BLOB('medium')
      },
      description: {
        type: Sequelize.STRING
      },
      status: {
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
      id_team: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Team_Admins',
          key: 'id',
          as: 'id_team'
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
    await queryInterface.dropTable('Supports');
  }
};