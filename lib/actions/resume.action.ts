"use server";

import { PDFParse } from "pdf-parse";

export async function extractResumeText(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        console.error("[ResumeAction] No file provided in FormData");
        return { success: false, message: "No file provided" };
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
        console.error("[ResumeAction] Unsupported file type:", file.name);
        return {
            success: false,
            message: "Currently only PDF files are supported for resume analysis."
        };
    }

    console.log(`[ResumeAction] Extracting text from: ${file.name} (${file.size} bytes)`);

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Add a timeout to prevent hanging the server action
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Extraction timed out after 15 seconds")), 15000)
        );

        const parsePromise = (async () => {
            try {
                const parser = new PDFParse({ data: buffer });
                const result = await parser.getText();
                return result.text;
            } catch (err) {
                console.error("[ResumeAction] PDFParse internal error:", err);
                throw err;
            }
        })();

        const text = await Promise.race([parsePromise, timeoutPromise]) as string;

        if (!text || text.trim().length === 0) {
            console.warn("[ResumeAction] Extracted text is empty");
            return { success: false, message: "Could not extract any text from the resume." };
        }

        console.log(`[ResumeAction] Successfully extracted ${text.length} characters`);

        // Limit text length to avoid Firestore limits (1MB is ~1M characters, but tokens differ)
        // 100k characters is plenty for a resume
        const truncatedText = text.slice(0, 100000);

        return {
            success: true,
            text: truncatedText
        };
    } catch (error: any) {
        console.error("[ResumeAction] Error extracting text from PDF:", error);
        return { success: false, message: error.message || "Failed to extract text from PDF" };
    }
}
