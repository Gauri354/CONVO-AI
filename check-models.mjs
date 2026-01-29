// Test which models are available for your API key
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listAvailableModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ No API key found in .env.local");
    return;
  }

  console.log("✓ API Key found");
  console.log("Testing available models...\n");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Test common model names
  const modelsToTest = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash-exp",
  ];

  let workingModel = null;

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello in one word");
      const text = result.response.text();
      console.log(`✅ SUCCESS! ${modelName} works!`);
      console.log(`   Response: ${text}\n`);
      workingModel = modelName;
      break; // Stop after finding first working model
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }

  if (workingModel) {
    console.log(`\n🎉 Use this model in your code: "${workingModel}"`);
  } else {
    console.log("\n❌ No models are available for this API key.");
    console.log("Please enable the Generative Language API:");
    console.log("https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
  }
}

listAvailableModels().catch(console.error);
