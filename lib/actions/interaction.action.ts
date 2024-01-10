"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import Interaction from "@/database/interaction.model";

// This is a function  to count all views for each question

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    await connectToDatabase();

    const { questionId, userId } = params;
    const newQuestionId = questionId.toString();
    const view = "view";

    // Update view count for the question
    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

    // if the user already saw it
    if (userId) {
      const existingInteraction = await Interaction.findOne({
        user: userId,
        action: view,
        question: newQuestionId,
      });

      if (existingInteraction) return console.log("User has already viewed.");

      // if user did not have any previous interactions, Create interaction
      await Interaction.create({
        user: userId,
        action: view,
        question: questionId,
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
