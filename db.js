const { Sequelize } = require('sequelize');
const config = require('./config');
const sequelize = new Sequelize(config.development);

(async () => {
  try {
    await sequelize.authenticate();
   // console.log('Connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
})();

module.exports = sequelize;