const sequelize = require("../db");

module.exports = async function withOptimisticRetry(fn, maxRetries = 3) {
  let attempt = 0;

  while (attempt < maxRetries) {
    const transaction = await sequelize.transaction();
    try {
      const result = await fn(transaction);
      await transaction.commit();
      return result;
    } catch (err) {
      await transaction.rollback();

      console.warn(`Retry attempt ${attempt + 1} failed: ${err.message}`);

      if (attempt === maxRetries - 1) {
        throw new Error("Max retries reached: " + err.message);
      }

      await new Promise((r) => setTimeout(r, 10 * (attempt + 1)));
      attempt++;
    }
  }
};
