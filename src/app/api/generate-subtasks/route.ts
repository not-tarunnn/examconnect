import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY ;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `Generate exactly 5 short, actionable subtasks for the task titled: "${title}".` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "array",
              items: { type: "string" },
              minItems: 5,
              maxItems: 5
            }
          }
        }),
      }
    );

    const data = await geminiRes.json();
    const subtasks = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]");

    return NextResponse.json({ subtasks });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
