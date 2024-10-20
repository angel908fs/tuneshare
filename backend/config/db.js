const mongoose = require("mongoose");

const connectToDB = async () => {
    if (process.env.NODE_ENV === 'test') {
        console.log('Skipping DB connection in test environment'); // shouldn't connect to DB for unit testing
        return;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to MongoDB Database: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectToDB;