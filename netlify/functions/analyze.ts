import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

/* ------------------------- 型定義 ------------------------- */
interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: { message: string };
}

interface AnalysisResult {
  seo: string;
  ux: string;
  conversion: string;
  strengths: string;
  weaknesses: string;
  improvement: string;
}

/* --------------------- Geminiで解析 ---------------------- */
async function analyzeWithGemini(htmlContent: string): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

 const prompt = `あなたはプロのWebコンサルタントです。
以下のHTMLを分析し、読みやすく丁寧な文章でレポートを作成してください。

【重要ルール】
・必ず「適度な改行」を入れて読みやすくしてください
・1つの項目につき 3〜6 行程度の段落にしてください
・箇条書きがあればそのまま維持して OK
・専門用語はできるだけ噛み砕いた表現にしてください

【出力形式（必ず JSON）】
{
  "seo": "（改行を含む SEO分析）",
  "ux": "（改行を含む UX/UI分析）",
  "conversion": "（改行を含む CV改善案）",
  "strengths": "（改行を含む 強み）",
  "weaknesses": "（改行を含む 弱み）",
  "improvement": "（改行を含む 改善提案）"
}

HTML（冒頭40,000文字）:
${htmlContent.substring(0, 40000)}
`;


  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  if (!response.ok) {
    const err = await response.text();
    console.error("Gemini API error:", err);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.candidates?.length) throw new Error("No response from Gemini");

  const rawText = data.candidates[0].content.parts[0].text;

  // JSON 抽出
  const jsonStart = rawText.indexOf('{');
  const jsonEnd = rawText.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    console.error("Gemini raw:", rawText);
    throw new Error("JSON部分を解析できませんでした");
  }

  const jsonString = rawText.slice(jsonStart, jsonEnd + 1);

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON parse error:", jsonString);
    throw new Error("Geminiの返却JSON解析に失敗しました");
  }

  return {
    seo: parsed.seo || "",
    ux: parsed.ux || "",
    conversion: parsed.conversion || "",
    strengths: parsed.strengths || "",
    weaknesses: parsed.weaknesses || "",
    improvement: parsed.improvement || "",
  };
}

/* ---------------------- API Handler ---------------------- */
const handler: Handler = async (event: HandlerEvent) => {

  // CORS → WordPress iframe でも使えるように
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: "",
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: "URL is required" }) };
    }

    // URL形式チェック
    try { new URL(url); }
    catch { return { statusCode: 400, body: JSON.stringify({ error: "Invalid URL format" }) }; }

    /* ------------ HTML Fetch ------------- */
    let htmlContent = "";
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "ja,en;q=0.8",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Failed to fetch URL: ${res.status}` }),
        };
      }

      htmlContent = await res.text();
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: "Failed to fetch website" }) };
    }

    /* ----------- Gemini解析 ----------- */
    const result = await analyzeWithGemini(htmlContent);

    /* ----------- 結果返却 ----------- */
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result),
    };

  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
};

export { handler };
