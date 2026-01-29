import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY!
);

const model = genAI.getGenerativeModel({
  model: "models/gemini-flash-latest",
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ]
});

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const prompt = `Prepare questions for a job interview.
      The job role is ${role}.
      The job experience level is ${level}.
      The tech stack used in the job is: ${techstack}.
      The focus between behavioural and technical questions should lean towards: ${type}.
      The amount of questions required is: ${amount}.
      Please return only the questions, without any additional text.
      The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
      Return ONLY a raw JSON array of strings:
      ["Question 1", "Question 2", "Question 3"]
    `;

    console.log("Generating interview questions using gemini-pro via API route...");
    const result = await model.generateContent(prompt);
    const questionsText = result.response.text();

    if (!questionsText) {
      throw new Error("AI returned empty questions text.");
    }

    // Clean JSON string in case the model adds markdown
    const jsonString = questionsText.replace(/```json\n?|```/g, "").trim();

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: typeof techstack === "string" ? techstack.split(",") : techstack,
      questions: JSON.parse(jsonString),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);

    return Response.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in AI Generate Route:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Service is active." }, { status: 200 });
}
