const mongoose = require("mongoose");

const ConnectBD = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
    //   userUnifiedTopology: true,
    //   useFindAndModify: true,
    });
    console.log(`Mongodb Connected:${connection.connection.host}`);
  } catch (error) {
    console.log(`Error:${error.message}`);
    process.exit();
  }
};

module.exports=ConnectBD;