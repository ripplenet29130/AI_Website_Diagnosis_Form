import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
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
  const model = process.env.AI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `あなたはプロのWebコンサルタントです。
以下のHTMLを元に、SEOの不足点、UI/UXの問題点、コンバージョン改善点、強み、弱み、改善提案（短期・中長期）を日本語で出力してください。

必ず以下のJSON形式で回答してください：
{
  "seo": "SEO分析の内容",
  "ux": "UI/UX分析の内容",
  "conversion": "コンバージョン改善の内容",
  "strengths": "強みの内容",
  "weaknesses": "弱みの内容",
  "improvement": "改善提案の内容"
}

HTML:
${htmlContent.substring(0, 30000)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
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

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }

  const text = data.candidates[0].content.parts[0].text;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      seo: parsed.seo || 'SEO分析が取得できませんでした',
      ux: parsed.ux || 'UX分析が取得できませんでした',
      conversion: parsed.conversion || 'コンバージョン分析が取得できませんでした',
      strengths: parsed.strengths || '強みが取得できませんでした',
      weaknesses: parsed.weaknesses || '弱みが取得できませんでした',
      improvement: parsed.improvement || '改善提案が取得できませんでした',
    };
  }

  throw new Error('Failed to parse Gemini response as JSON');
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
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
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    try {
      new URL(url);
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid URL format' }),
      };
    }

    let htmlContent = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)',
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
      console.log(`Fetched HTML from ${url}, length: ${htmlContent.length}`);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to fetch the website' }),
      };
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
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
    };
  }
};

export { handler };
