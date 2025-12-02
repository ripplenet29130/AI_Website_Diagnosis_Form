import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

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

async function analyzeWithGemini(htmlContent: string): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL || 'gemini-2.0-flash'; // ←最新に変更

  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const prompt = `あなたはプロのWebコンサルタントです。
以下のHTMLを元にサイトを包括的に分析してください。

必ず以下のJSONフォーマットで返してください：

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
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.candidates?.length) throw new Error('No response from Gemini');

  const rawText = data.candidates[0].content.parts[0].text;

  // JSON抽出の精度改善
  const jsonStart = rawText.indexOf('{');
  const jsonEnd = rawText.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    console.error("Gemini full response:", rawText);
    throw new Error("JSON部分を解析できませんでした");
  }

  const jsonString = rawText.slice(jsonStart, jsonEnd + 1);
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON Parse error:", err, jsonString);
    throw new Error("Geminiの返却JSON解析に失敗しました");
  }

  return {
    seo: parsed.seo || '',
    ux: parsed.ux || '',
    conversion: parsed.conversion || '',
    strengths: parsed.strengths || '',
    weaknesses: parsed.weaknesses || '',
    improvement: parsed.improvement || '',
  };
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { url } = body;

    if (!url || typeof url !== 'string')
      return { statusCode: 400, body: JSON.stringify({ error: 'URL is required' }) };

    try {
      new URL(url);
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid URL format' }) };
    }

    let htmlContent = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept-Language': 'ja,en;q=0.8',
          'Accept': 'text/html,application/xhtml+xml'
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Failed to fetch URL: ${response.status}` }),
        };
      }

      htmlContent = await response.text();
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Failed to fetch the website' }) };
    }

    const result = await analyzeWithGemini(htmlContent);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal server error',
      }),
    };
  }
};

export { handler };
