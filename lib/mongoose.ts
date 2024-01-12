import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    return console.log("MISSING MONGODB_URL");
  }

  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "devflowjsmastery",
    });

    isConnected = true;

    console.log("Atlas Connected and Running!!!");
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
};
