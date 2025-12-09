import { Handler, HandlerEvent } from '@netlify/functions'

interface LLMResponse {
  seo: string;
  ux: string;
  conversion: string;
  strengths: string;
  weaknesses: string;
  improvement: string;
}

const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";
const AI_MODEL = process.env.AI_MODEL || "gemini-2.0-flash";

/* ---------- Gemini ---------- */
async function analyzeWithGemini(htmlContent: string): Promise<LLMResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const prompt = `あなたはプロのWebコンサルタントです。
以下のHTMLをもとに Webサイトを分析し、
**必ず「箇条書き（・）」のみで出力してください。**

【重要ルール】
・各項目は必ず 4〜7 個の bullet list で返す
・文章は 1文を短くして読みやすくする
・改行をしっかり入れて整形する
・段落は作らず、箇条書き 1 行のみで返す

【出力形式（必ず JSON）】
{
  "seo": ["・...", "・...", ...],
  "ux": ["・...", "・...", ...],
  "conversion": ["・...", "・...", ...],
  "strengths": ["・...", "・...", ...],
  "weaknesses": ["・...", "・...", ...],
  "improvement": ["・...", "・...", ...]
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
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      })
    }
  );

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");

  return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
}

/* ============================================================
   Main Handler
============================================================ */
const handler: Handler = async (event: HandlerEvent) => {
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

    /* ---------- LLMs.txt チェック ---------- */
    const llmsUrl = `${url.replace(/\/$/, "")}/llms.txt`;
    let llmsStatus = "not_installed";

    try {
      const llmsRes = await fetch(llmsUrl, { method: "GET", signal: AbortSignal.timeout(5000) });
      if (llmsRes.status === 200) {
        llmsStatus = "installed";
      }
    } catch (e) {
      llmsStatus = "error";
    }

    // HTML取得
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Failed to fetch URL: ${res.status}`, llms: llmsStatus }),
      };
    }

    const htmlContent = await res.text();
    const result = await analyzeWithGemini(htmlContent);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ llms: llmsStatus, ai: result }),
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


