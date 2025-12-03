import { Handler, HandlerEvent } from '@netlify/functions';

/* ------------------------- 型定義 ------------------------- */
interface LLMResponse {
  seo: string;
  ux: string;
  conversion: string;
  strengths: string;
  weaknesses: string;
  improvement: string;
}

/* ------------------------- AI選択 ------------------------- */
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";  // gemini / openai
const AI_MODEL = process.env.AI_MODEL || "gemini-2.0-flash";

/* ============================================================
   Gemini 解析
============================================================ */
async function analyzeWithGemini(htmlContent: string): Promise<LLMResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const prompt = `あなたはプロのWebコンサルタントです。
以下のHTMLを分析し、読みやすく丁寧な文章でレポートを作成してください。

【重要ルール】
・必ず「適度な改行」を入れて読みやすくしてください
・1つの項目につき 3〜6 行程度の段落にしてください
・箇条書きがあればそのまま維持して OK
・専門用語はできるだけ噛み砕いた表現にしてください

【出力形式（必ず JSON）】
{
  "seo": "",
  "ux": "",
  "conversion": "",
  "strengths": "",
  "weaknesses": "",
  "improvement": ""
}

HTML（冒頭40,000文字）:
${htmlContent.substring(0, 40000)}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topK: 40,
          topP: 0.95,
        },
      }),
    }
  );

  const data = await response.json();

  if (data.error) throw new Error(data.error.message);

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("Gemini JSON抽出失敗");

  return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
}

/* ============================================================
   OpenAI (ChatGPT) 解析
============================================================ */
async function analyzeWithOpenAI(htmlContent: string): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const prompt = `あなたはプロのWebコンサルタントです。
以下のHTMLを分析し、読みやすく丁寧な文章でレポートを作成してください。

【重要ルール】
・必ず「適度な改行」を入れて読みやすくしてください
・1つの項目につき 3〜6 行程度の段落にしてください
・箇条書きがあればそのまま維持して OK
・専門用語はできるだけ噛み砕いた表現にしてください

【必ず JSON 形式で返す】
{
  "seo": "",
  "ux": "",
  "conversion": "",
  "strengths": "",
  "weaknesses": "",
  "improvement": ""
}

HTML（冒頭40,000文字）:
${htmlContent.substring(0, 40000)}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL, // gpt-4o-mini など
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    console.error("OpenAI返却:", text);
    throw new Error("OpenAI JSON抽出失敗");
  }

  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

/* ============================================================
   メイン API Handler
============================================================ */
const handler: Handler = async (event: HandlerEvent) => {
  // CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { url } = body;

    if (!url) return { statusCode: 400, body: JSON.stringify({ error: "URL is required" }) };

    try { new URL(url); }
    catch { return { statusCode: 400, body: JSON.stringify({ error: "Invalid URL format" }) }; }

    // HTML取得
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Failed to fetch URL: ${res.status}` }),
      };
    }

    const htmlContent = await res.text();

    // 🔥 AI プロバイダを自動選択
    const result =
      AI_PROVIDER === "openai"
        ? await analyzeWithOpenAI(htmlContent)
        : await analyzeWithGemini(htmlContent);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result),
    };

  } catch (err: any) {
    console.error("ERROR:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
};

export { handler };
