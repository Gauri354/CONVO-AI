// Test with explicit v1 endpoint (not v1beta)
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testWithV1() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ No API key found");
    return;
  }

  console.log("✓ API Key found");
  console.log("Testing with different API versions...\n");

  // Test 1: Try the standard models list endpoint
  try {
    console.log("Fetching available models list...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.models) {
      console.log("\n✅ Available models:");
      data.models.forEach(model => {
        console.log(`  - ${model.name}`);
      });
    } else {
      console.log("❌ No models found");
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Error fetching models:", error.message);
  }
}

testWithV1().catch(console.error);
