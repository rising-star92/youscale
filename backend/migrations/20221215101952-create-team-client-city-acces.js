'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Team_Client_City_Acces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_team: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'Team_Users',
          key: 'id',
          as: 'id_team'
        }
      },
      id_city: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references:{
          model : 'City_Users',
          key: 'id',
          as: 'id_city'
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
    await queryInterface.dropTable('Team_Client_City_Acces');
  }
};