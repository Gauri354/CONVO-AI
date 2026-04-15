"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { db } from "@/firebase/admin";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    if (!interviewDoc.exists) throw new Error("Interview not found");
    const interviewData = interviewDoc.data()!;

    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const codingSection = interviewData.codingRoundCompleted && interviewData.codingQuestions
      ? `
      **Coding Round Data**:
      ${interviewData.codingQuestions.map((q: string, i: number) => {
        const answer = interviewData.codingAnswers?.[i + 1] || "No answer provided";
        return `Question ${i + 1}: ${q}\nUser Answer: ${answer}\n`;
      }).join("\n")}
      `
      : "Coding round was skipped.";

    const prompt = `
      You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. 
      Analyze the Verbal Transcript and the Coding Round Data (if provided).
      
      Verbal Transcript:
      ${formattedTranscript}

      ${codingSection}

      Be thorough and balanced in your analysis. If there are mistakes, point them out.
      
      Please score the candidate from 0 to 100 in the following categories:
      - Communication Skills
      - Technical Knowledge (Combined Verbal + Coding)
      - Problem-Solving (Emphasis on Coding logic)
      - Cultural & Role Fit
      - Confidence & Clarity

      IMPORTANT: If the coding round was skipped, reduce the weights of Technical Knowledge and Problem-Solving accordingly.

      You must return ONLY a raw JSON object (no markdown blocks, no other text) matching this schema structure:
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
        "finalAssessment": string,
        "codingOverallScore": number (0-100, 0 if skipped),
        "codingDetailedAnalysis": [
          { 
            "question": string, 
            "userAnswer": string, 
            "isCorrect": boolean, 
            "optimalSolution": string, 
            "explanation": string, 
            "score": number (0-10)
          }
        ] (empty array if skipped)
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
      codingOverallScore: object.codingOverallScore,
      codingDetailedAnalysis: object.codingDetailedAnalysis,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);
    await db.collection("interviews").doc(interviewId).update({ finalized: true });

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

import { sendEmail } from "@/lib/nodemailer";
import { auth as adminAuth } from "@/firebase/admin";

export async function createInterview(params: any) {
  const { role, level, techstack, type, userId, questions, status, resumeText, scheduledAt } = params;

  try {
    // Get user details for email notification
    let userEmail = "";
    try {
      const userRecord = await adminAuth.getUser(userId);
      userEmail = userRecord.email || "";
    } catch (e) {
      console.warn("Could not fetch user email for notification", e);
    }

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
      scheduledAt: scheduledAt || null,
      resumeText: params.resumeText || "",
      focus: params.focus || "",
      duration: params.duration || "",
    };

    const docRef = await db.collection("interviews").add(interview);

    // Send notification email if scheduled for later
    if (status === "scheduled" && userEmail && scheduledAt) {
      const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const magicToken = crypto.randomUUID();
      await db.collection("interviews").doc(docRef.id).update({ magicToken });

      const appUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?token=${magicToken}&interviewId=${docRef.id}`;

      await sendEmail({
        to: userEmail,
        subject: "Interview Scheduled - SmartInterview",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="text-align: center; padding: 20px 0;">
              <h2 style="color: #4f46e5; margin: 0;">Interview Scheduled!</h2>
            </div>
            
            <p>Hello,</p>
            <p>Your mock interview for the <strong>${role}</strong> role has been successfully scheduled. Here are the details:</p>
            
            <div style="margin: 20px 0; padding: 25px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
              <p style="margin: 0 0 10px 0;"><strong>📅 Time:</strong> ${formattedDate}</p>
              <p style="margin: 0 0 10px 0;"><strong>🎯 Focus:</strong> ${params.focus || role}</p>
              <p style="margin: 0 0 10px 0;"><strong>📊 Level:</strong> ${level}</p>
              <p style="margin: 0;"><strong>🕒 Duration:</strong> ${params.duration || "30 mins"}</p>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${appUrl}" target="_blank" style="background-color: #4f46e5; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                Start Now
              </a>
              <p style="font-size: 12px; color: #64748b; margin-top: 10px;">Clicking this will take you to your dashboard to start the session.</p>
            </div>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; text-align: center;">
              Best regards,<br>
              <strong>The SmartInterview Team</strong>
            </p>
          </div>
        `
      });
    }

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
  try {
    const snapshot = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .get();

    const interviews = snapshot.docs.map((doc) => {
      const data = doc.data();
      return JSON.parse(JSON.stringify({
        id: doc.id,
        ...data,
      }));
    });

    return interviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as Interview[];
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
}

export async function generateCodingQuestions(interviewId: string) {
  try {
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    if (!interviewDoc.exists) return { success: false, message: "Interview not found" };

    const interviewData = interviewDoc.data()!;
    const techStackString = Array.isArray(interviewData.techstack) ? interviewData.techstack.join(", ") : interviewData.techstack;

    const prompt = `
      You are an AI technical recruiter. Based on the following interview context, generate exactly 10 STRICTLY CODING challenges.
      Role: ${interviewData.role}
      Level: ${interviewData.level}
      Tech Stack: ${techStackString}
      Resume Context: ${interviewData.resumeText || "No resume provided"}

      CRITICAL REQUIREMENTS:
      1. These must be technical coding problems (Data Structures, Algorithms, or practical implementation tasks).
      2. Each question must require writing a complete function or script.
      3. NO theoretical questions, NO short-answer questions.
      4. Keep the problem description concise but clear with input/output expectations.
      
      IMPORTANT: Return ONLY a raw JSON array of strings (no markdown blocks).
      Example: ["Write a function to reverse a linked list.", "Implement a binary search algorithm.", ...]
    `;


    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const questions = JSON.parse(text.replace(/```json\n?|```/g, "").trim());

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format generated by AI");
    }

    await db.collection("interviews").doc(interviewId).update({ codingQuestions: questions });

    return { success: true, questions };
  } catch (error: any) {
    console.error("Error generating coding questions:", error);
    return { success: false, message: error.message };
  }
}

export async function saveCodingAnswer(interviewId: string, step: number, code: string) {
  try {
    await db.collection("interviews").doc(interviewId).set({
      codingAnswers: {
        [step]: code
      }
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Error saving coding answer:", error);
    return { success: false, message: error.message };
  }
}

export async function completeCodingRound(interviewId: string) {
  try {
    await db.collection("interviews").doc(interviewId).update({ codingRoundCompleted: true });
    return { success: true };
  } catch (error: any) {
    console.error("Error completing coding round:", error);
    return { success: false, message: error.message };
  }
}