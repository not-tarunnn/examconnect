import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = "AIzaSyAluC7rb3DHvT_bvvrwO3u8AGUSP12iFVs";
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing Gemini API key in environment variables" },
        { status: 500 }
      );
    }

    const prompt = `Generate exactly 5 short, actionable subtasks for the task titled: "{title}".

Return **ONLY** a valid JSON array of 5 strings, formatted like this example (including the square brackets and quotes):

["subtask 1", "subtask 2", "subtask 3", "subtask 4", "subtask 5"]

Do NOT include any text, titles, explanations, punctuation, or characters outside the JSON array. Your entire response must be a single valid JSON array and nothing else.
`;

    const maxRetries = 1;
    let attempts = 0;
    let subtasks: string[] = [];
    let lastRawText = "";

    while (attempts < maxRetries) {
      attempts++;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await geminiRes.json();

      lastRawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      try {
        subtasks = JSON.parse(lastRawText);

        // Check if parsed result is array of strings
        if (
          Array.isArray(subtasks) &&
          subtasks.length === 5 &&
          subtasks.every((item) => typeof item === "string")
        ) {
          // Valid JSON array response, break retry loop
          break;
        } else {
          subtasks = [];
          // Continue to retry if format incorrect
        }
      } catch {
        // Parsing failed, continue to retry
      }
    }

    if (subtasks.length === 0) {
      // After retries, no valid JSON
      return NextResponse.json(
        {
          error: "Failed to generate valid JSON subtasks after retries",
          raw: lastRawText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ subtasks });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
