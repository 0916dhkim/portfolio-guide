const dotenv = require("dotenv");
dotenv.config();

const config = {
  db: {
    url: process.env.DATABASE_URL,
  },
};

module.exports = config;
