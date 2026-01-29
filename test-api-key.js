// Quick test script to verify your Google AI API key
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testApiKey() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERROR: GOOGLE_GENERATIVE_AI_API_KEY not found in environment");
    console.log("Please check your .env.local file");
    return;
  }

  console.log("✓ API Key found (length:", apiKey.length, ")");
  console.log("Testing connection to Google AI...\n");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try different model names
  const modelsToTest = [
    "gemini-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "models/gemini-pro",
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      const text = result.response.text();
      console.log(`✅ SUCCESS with ${modelName}`);
      console.log(`Response: ${text.substring(0, 50)}...\n`);
      break; // Stop after first success
    } catch (error) {
      console.log(`❌ FAILED with ${modelName}`);
      console.log(`Error: ${error.message}\n`);
    }
  }
}

testApiKey().catch(console.error);
