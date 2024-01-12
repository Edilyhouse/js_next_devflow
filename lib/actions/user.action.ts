"use server";

import { connectToDatabase } from "../mongoose";
import { FilterQuery } from "mongoose";
import User from "@/database/user.model";
import {
  CreateUserParams,
  UpdateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  ToggleSaveQuestionParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";
import { BadgeCriteriaType } from "@/types";

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

// fopy from here

// export async function getAllUsers(params: GetAllUsersParams) {
//   try {
//     connectToDatabase();
//   } catch (error) {
//     console.log("error getting all users", error);
//     throw error;
//   }
// }

//
//
// Get all users

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();
    // const { page = 1 , pageSize = 20, filter, searchQuery } = params;

    const users = await User.find({}).sort({ createdAt: -1 });

    return { users };
  } catch (error) {
    console.log("error getting all users", error);
    throw error;
  }
}

//  It saves a questions into a user preferences
export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    await connectToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved = user.saved.includes(questionId);

    if (isQuestionSaved) {
      // remove question from saved
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true }
      );
    } else {
      // add question to saved
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    await connectToDatabase();

    const { clerkId, page = 1, pageSize = 10, filter, searchQuery } = params;

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const savedQuestions = user.saved;

    return { questions: savedQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    // const [questionUpvotes] = await Question.aggregate([
    //   { $match: { author: user._id } },
    //   {
    //     $project: {
    //       _id: 0,
    //       upvotes: { $size: "$upvotes" },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalUpvotes: { $sum: "$upvotes" },
    //     },
    //   },
    // ]);

    // const [answerUpvotes] = await Answer.aggregate([
    //   { $match: { author: user._id } },
    //   {
    //     $project: {
    //       _id: 0,
    //       upvotes: { $size: "$upvotes" },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalUpvotes: { $sum: "$upvotes" },
    //     },
    //   },
    // ]);

    // const [questionViews] = await Answer.aggregate([
    //   { $match: { author: user._id } },
    //   {
    //     $group: {
    //       _id: null,
    //       totalViews: { $sum: "$views" },
    //     },
    //   },
    // ]);

    // const criteria = [
    //   { type: "QUESTION_COUNT" as BadgeCriteriaType, count: totalQuestions },
    //   { type: "ANSWER_COUNT" as BadgeCriteriaType, count: totalAnswers },
    //   {
    //     type: "QUESTION_UPVOTES" as BadgeCriteriaType,
    //     count: questionUpvotes?.totalUpvotes || 0,
    //   },
    //   {
    //     type: "ANSWER_UPVOTES" as BadgeCriteriaType,
    //     count: answerUpvotes?.totalUpvotes || 0,
    //   },
    //   {
    //     type: "TOTAL_VIEWS" as BadgeCriteriaType,
    //     count: questionViews?.totalViews || 0,
    //   },
    // ];

    // const badgeCounts = assignBadges({ criteria });

    return {
      user,
      totalQuestions,
      totalAnswers,
      // badgeCounts,
      // reputation: user.reputation,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalQuestions = await Question.countDocuments({ author: userId });

    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");

    const isNextQuestions = totalQuestions > skipAmount + userQuestions.length;

    return { totalQuestions, questions: userQuestions, isNextQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalAnswers = await Answer.countDocuments({ author: userId });

    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");

    const isNextAnswer = totalAnswers > skipAmount + userAnswers.length;

    return { totalAnswers, answers: userAnswers, isNextAnswer };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
