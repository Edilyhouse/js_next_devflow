"use server";

import { connectToDatabase } from "../mongoose";

export async function createQuestion(params: any) {
  console.log(params);
  try {
    connectToDatabase();
  } catch (error) {
    console.log(error);
  }
}
