const { bgGreen } = require("colors");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    if (process.env.NODE_ENV === "development") {
      console.log(`MongoDB connected: ${conn.connection.host.bgGreen}`);
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = connectDB;
