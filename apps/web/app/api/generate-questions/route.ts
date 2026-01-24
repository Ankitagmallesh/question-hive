import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const message = formData.get("message") as string
    const difficultyLevel = formData.get("difficultyLevel") as string
    const subject = formData.get("subject") as string

    // Get uploaded files
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file_") && value instanceof File) {
        files.push(value)
      }
    }

    // Prepare the request to Gemini API
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const systemPrompt = `You are QuestionHive, an expert educational question paper generator AI assistant. Your sole purpose is to help create high-quality educational content for academic purposes.

STRICT CONTENT GUIDELINES:
- ONLY generate educational and academic content
- NO explicit, mature, or 18+ content under any circumstances
- NO personal information requests or sharing
- NO inappropriate, offensive, or harmful content
- NO content that violates educational standards or policies
- REFUSE any requests outside educational question generation


Context:
- Subject: ${subject || "General"}
- Difficulty Level: ${difficultyLevel}
- User Request: ${message}

Educational Guidelines:
1. Generate questions appropriate for the specified difficulty level and subject
2. Include variety: MCQ, short answer, long answer, fill-in-the-blanks, true/false
3. Ensure questions are clear, unambiguous, and educationally sound
4. Provide proper marking schemes and answer keys when appropriate
5. If images are provided, analyze them for educational content only
6. Focus on curriculum-aligned, age-appropriate content
7. Maintain academic integrity and educational value

Response Format:
- Start responses with "QuestionHive here! 📚"
- Provide clear, conversational responses
- Format questions with proper numbering and structure
- Use clean, readable text (no JSON format)
- Include brief explanations when helpful

If a request is inappropriate or non-educational, politely redirect: "I'm QuestionHive, designed specifically for educational question generation. Please share your academic subject and what type of questions you'd like me to create for you!"`

    // Prepare content for Gemini API
    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [{ text: systemPrompt }]

    // Add text message if provided
    if (message) {
      parts.push({ text: `User Message: ${message}` })
    }

    // Process uploaded files
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        // Convert image to base64 for Gemini API
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString("base64")

        parts.push({
          inline_data: {
            mime_type: file.type,
            data: base64,
          },
        })
      } else {
        // For text files, read content
        const text = await file.text()
        parts.push({ text: `File Content (${file.name}):\n${text}` })
      }
    }

    // Make request to Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: parts,
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text()
      console.error("Gemini API Error:", errorData)
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
    }

    const geminiData = await geminiResponse.json()
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated"

    const cleanedText = generatedText
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove ** bold formatting
      .replace(/\*(.*?)\*/g, "$1") // Remove * italic formatting
      .replace(/#{1,6}\s/g, "") // Remove markdown headers
      .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // Remove code formatting
      .trim()

    return NextResponse.json({
      response: cleanedText,
      success: true,
    })
  } catch (error) {
    console.error("Error in generate-questions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
