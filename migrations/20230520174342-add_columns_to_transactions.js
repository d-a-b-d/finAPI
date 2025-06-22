"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // These columns already exist, so skip them
    // await queryInterface.addColumn('transactions', 'created_at', {
    //   type: Sequelize.DATE,
    //   allowNull: false,
    //   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    // });
    // await queryInterface.addColumn('transactions', 'updated_at', {
    //   type: Sequelize.DATE,
    //   allowNull: false,
    //   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // These would break if the columns existed before this migration
    // await queryInterface.removeColumn('transactions', 'created_at');
    // await queryInterface.removeColumn('transactions', 'updated_at');
  },
};
