const dotenv = require('dotenv');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (!envFound) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
module.exports = {
  port: process.env.PORT,
  databaseURL: process.env.DATABASE_URL,
 
};
