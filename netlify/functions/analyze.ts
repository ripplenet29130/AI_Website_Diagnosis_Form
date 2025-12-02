import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
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

    const result = {
      seo: 'ダミーSEO',
      ux: 'ダミーUX',
      conversion: 'ダミーCV',
      strengths: 'ダミー強み',
      weaknesses: 'ダミー弱み',
      improvement: '- ダミー改善1\n- ダミー改善2',
    };

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
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
