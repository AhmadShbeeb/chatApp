const mogoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mogoose.connect(process.env.MONGO_URI);
    console.log(`connected ${conn.connection.host}`.black.bold.bgGreen);
  } catch (error) {
    console.log(`${error}`.black.bold.bgRed);
    process.exit(1);
  }
};

module.exports = connectDB;
