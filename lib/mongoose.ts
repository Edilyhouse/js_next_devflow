import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    return console.log("MISSING MONGODB_URL");
  }

  if (isConnected) {
    return console.log("MONGODB IS ALREADY CONNECTED FROM MOONGOSE.TS");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "devflowjsmastery",
    });

    isConnected = true;

    console.log("MongoDB is connected");
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
};
