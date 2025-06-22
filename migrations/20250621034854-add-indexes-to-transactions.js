'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class WHERE relname = 'transactions_source_account_id'
        ) THEN
          CREATE INDEX transactions_source_account_id ON transactions(source_account_id);
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class WHERE relname = 'transactions_destination_account_id'
        ) THEN
          CREATE INDEX transactions_destination_account_id ON transactions(destination_account_id);
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class WHERE relname = 'transactions_timestamp'
        ) THEN
          CREATE INDEX transactions_timestamp ON transactions(timestamp);
        END IF;
      END
      $$;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      "transactions",
      "transactions_source_account_id"
    );
    await queryInterface.removeIndex(
      "transactions",
      "transactions_destination_account_id"
    );
    await queryInterface.removeIndex("transactions", "transactions_timestamp");
  },
};
