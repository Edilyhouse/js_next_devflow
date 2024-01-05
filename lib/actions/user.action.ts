"use server";

import { connectToDatabase } from "../mongoose";
import User from "@/database/user.model";
import {
  CreateUserParams,
  UpdateUserParams,
  DeleteUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

export async function getUserById(params: any) {
  try {
    connectToDatabase();
    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.log("Error Getting user by ID", error);
    throw error;
  }
}

// Save user into Mongo DB

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.log("Error creating a new user: userAction file", error);
    throw error;
  }
}

// Update or modify a user into MongoDB

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();
    const { clerkId, updateData, path } = params;
    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });
    revalidatePath(path);
  } catch (error) {
    console.log("Error creating a new user: userAction file", error);
    throw error;
  }
}

// Delete a user

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();
    const { clerkId } = params;
    const user = await User.findOneAndDelete({ clerkId });
    if (!user) {
      throw new Error("User Not Found");
    }

    // Delete user from data, questions, answer, comments, etc.
    // Starts getting the  Questions to after delete the answers attached to those questions
    // TODO add a validations when questions.find will not find anything to avoid page down

    const userQuestionsIds = await Question.find({ author: user._id }).distinct(
      "_id"
    );
    console.log(userQuestionsIds);
    // deleting the  user Questions
    await Question.deleteMany({ author: user._id });
    // TODO delete answers, coments, etc

    // until everything has been deleted we can delete the user
    const deletedUser = await User.findByIdAndDelete(user._id);
    return deletedUser;
  } catch (error) {
    console.log("Error to delete a User", error);
    throw error;
  }
}
