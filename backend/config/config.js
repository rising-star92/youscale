require('dotenv').config();

module.exports = {
  "development": {
      "username": process.env.DB_USER,
      "password": process.env.DB_PWD,
      "database": process.env.DB_NAME,
      "host": process.env.DB_HOST,
      "port": process.env.DB_PORT || 3306,
      "logging": false,
      "dialect": "mysql",
      "pool": {
        max: 20,
        acquire: 100000
      }
  },
  "test": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PWD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT || 3306,
    "logging": false,
    "dialect": "mysql",
    "pool": {
      max: 20,
      acquire: 100000
    }
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PWD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT || 3306,
    "logging": false,
    "dialect": "mysql",
    "pool": {
      max: 20,
      acquire: 100000
    }
  }
};