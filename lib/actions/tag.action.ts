"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag from "@/database/tag.model";

// fopy from here

// export async function getAllUsers(params: GetAllUsersParams) {
//   try {
//     connectToDatabase();
//   } catch (error) {
//     console.log("error getting all users", error);
//     throw error;
//   }
// }

// Getting tags that user has interacted with ... the most

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();

    const { userId, limit = 3 } = params;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Find interactions for user and groups BY TAGS .. ** HARD OPERATION
    // CREATE INTERACTION LATER ... this taks is pending
    console.log(limit); // remove this console log
    return [
      { _id: "1", name: "React" },
      { _id: "2", name: "Angular" },
      { _id: "3", name: "Ionic" },
    ];
  } catch (error) {
    console.log("error getting all users", error);
    throw error;
  }
}

// get all tags for tags page
export async function getAllTags(params: GetAllTagsParams) {
  try {
    connectToDatabase();

    const tags = await Tag.find({});

    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
