"use server";

export async function extractResumeText(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        console.error("[ResumeAction] No file provided in FormData");
        return JSON.parse(JSON.stringify({ success: false, message: "No file provided" }));
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
        console.error("[ResumeAction] Unsupported file type:", file.name);
        return JSON.parse(JSON.stringify({
            success: false,
            message: "Currently only PDF files are supported for resume analysis."
        }));
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
                // HACK: Use eval("require") to bypass Webpack's module system.
                // This allows pdf-parse to load in its native Node.js environment,
                // which avoids Object.defineProperty errors and resolver issues.
                const pdf = eval("require")("pdf-parse");

                // Handle different export styles of pdf-parse v2
                const ParserClass = pdf.PDFParse || pdf.default?.PDFParse || (typeof pdf === 'function' ? null : pdf);

                if (ParserClass && typeof ParserClass === 'function' && ParserClass.prototype?.getText) {
                    const parser = new ParserClass({
                        data: buffer,
                        verbosity: 0,
                        disableFontFace: true,
                        isEvalSupported: false,
                        isOffscreenCanvasSupported: false
                    });
                    const result = await parser.getText();
                    return result.text;
                } else {
                    // Fallback to legacy function style if detectable
                    const parseFn = typeof pdf === 'function' ? pdf : pdf.default;
                    if (typeof parseFn === 'function') {
                        const data = await parseFn(buffer);
                        return data.text;
                    }
                    throw new Error("Could not find a valid PDF parser in the module");
                }
            } catch (err) {
                console.error("[ResumeAction] PDF extraction failed:", err);
                throw err;
            }
        })();

        const text = await Promise.race([parsePromise, timeoutPromise]) as string;

        if (!text || text.trim().length === 0) {
            console.warn("[ResumeAction] Extracted text is empty");
            return JSON.parse(JSON.stringify({ success: false, message: "Could not extract any text from the resume." }));
        }

        console.log(`[ResumeAction] Successfully extracted ${text.length} characters`);

        // Limit text length to avoid Firestore limits (1MB is ~1M characters, but tokens differ)
        // 100k characters is plenty for a resume
        const truncatedText = text.slice(0, 100000);

        return JSON.parse(JSON.stringify({
            success: true,
            text: truncatedText
        }));
    } catch (error: any) {
        console.error("[ResumeAction] Error extracting text from PDF:", error);
        return JSON.parse(JSON.stringify({ success: false, message: error.message || "Failed to extract text from PDF" }));
    }
}
