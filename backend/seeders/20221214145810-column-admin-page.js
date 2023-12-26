'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Admin_Pages', [
      {
        name: 'dashbord',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'team',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'payment',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'support',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'setting',
        createdAt: new Date(),
        updatedAt: new Date()
      }
  ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('admin_pages', null, {});
  }
};
