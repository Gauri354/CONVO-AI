"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { db } from "@/firebase/admin";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const prompt = `
      You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
      Transcript:
      ${formattedTranscript}

      Please score the candidate from 0 to 100 in the following areas.
      - Communication Skills
      - Technical Knowledge
      - Problem-Solving
      - Cultural & Role Fit
      - Confidence & Clarity

      **Coding Round Analysis**: 
      - Specifically check if the AI asked "Are you comfortable for a coding round?" (or similar).
      - If the candidate said "No" or declined, you MUST:
        1. Mention "Coding round not attempted" in the **finalAssessment**.
        2. Significantly reduce the **Problem-Solving** and **Technical Knowledge** scores.
        3. Ensure the **totalScore** reflects this incomplete attempt.

      IMPORTANT: You must return ONLY a raw JSON object (no markdown blocks, no other text) matching this schema structure:
      {
        "totalScore": number,
        "categoryScores": [
          { "name": "Communication Skills", "score": number, "comment": string },
          { "name": "Technical Knowledge", "score": number, "comment": string },
          { "name": "Problem Solving", "score": number, "comment": string },
          { "name": "Cultural Fit", "score": number, "comment": string },
          { "name": "Confidence and Clarity", "score": number, "comment": string }
        ],
        "strengths": string[],
        "areasForImprovement": string[],
        "finalAssessment": string
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("AI failed to generate feedback content.");

    const jsonString = text.replace(/```json\n?|```/g, "").trim();
    const object = JSON.parse(jsonString);

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function createInterview(params: any) {
  const { role, level, techstack, type, userId, questions, status, resumeText } = params;

  try {
    // For Vapi AI, we rely on the dynamic agent prompts rather than pre-generating questions text.
    // This allows for a more adaptive, flowing interview experience.
    let interviewQuestions = questions || [];

    const interview = {
      role,
      type,
      level,
      techstack: typeof techstack === "string" ? techstack.split(",") : techstack,
      questions: interviewQuestions,
      userId,
      finalized: false,
      status: status || "scheduled",
      createdAt: new Date().toISOString(),
      resumeText: params.resumeText || "",
    };

    const docRef = await db.collection("interviews").add(interview);
    return JSON.parse(JSON.stringify({ success: true, id: docRef.id }));
  } catch (error: any) {
    console.error("Error creating interview:", error);
    return JSON.parse(JSON.stringify({ success: false, message: error.message }));
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  if (!interview.exists) return null;
  return JSON.parse(JSON.stringify({ id: interview.id, ...interview.data() })) as Interview;
}

export async function cancelInterview(id: string) {
  try {
    await db.collection("interviews").doc(id).update({ status: "cancelled" });
    return { success: true };
  } catch (error) {
    console.error("Error cancelling interview:", error);
    return { success: false };
  }
}

export async function startInterview(id: string) {
  try {
    await db.collection("interviews").doc(id).update({ status: "in-progress" });
    return { success: true };
  } catch (error) {
    console.error("Error starting interview:", error);
    return { success: false };
  }
}

export async function updateInterviewProgress(id: string, index: number) {
  try {
    await db.collection("interviews").doc(id).update({ currentQuestionIndex: index });
    return { success: true };
  } catch (error) {
    console.error("Error updating interview progress:", error);
    return { success: false };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return JSON.parse(JSON.stringify({ id: feedbackDoc.id, ...feedbackDoc.data() })) as Feedback;
}

export async function getAllFeedbacksByUserId(userId: string): Promise<Feedback[]> {
  const snapshot = await db.collection("feedback").where("userId", "==", userId).get();
  const feedbacks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
  return feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => JSON.parse(JSON.stringify({
    id: doc.id,
    ...doc.data(),
  }))) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const snapshot = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const interviews = snapshot.docs.map((doc) => {
    const data = doc.data();
    return JSON.parse(JSON.stringify({
      id: doc.id,
      ...data,
    }));
  });

  return interviews as Interview[];
}