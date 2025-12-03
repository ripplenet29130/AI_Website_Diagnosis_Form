import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import PDFDocument from 'pdfkit';

interface AnalysisResult {
  seo: string;
  ux: string;
  conversion: string;
  strengths: string;
  weaknesses: string;
  improvement: string;
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
    const result: AnalysisResult = body.result;

    if (!result) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Result data is required' }),
      };
    }

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    doc.fontSize(20).font('Helvetica-Bold').text('AI Webサイト診断レポート', { align: 'center' });
    doc.moveDown(2);

    const addSection = (title: string, content: string) => {
      doc.fontSize(16).font('Helvetica-Bold').text(title);
      doc.moveDown(0.5);

      const displayContent = content || '（データなし）';
      const lines = displayContent.split('\n');

      doc.fontSize(12).font('Helvetica');
      lines.forEach((line) => {
        if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          doc.text(`・ ${line.trim().replace(/^[-•]\s*/, '')}`, { indent: 20 });
        } else if (line.trim()) {
          doc.text(line.trim());
        }
      });

      doc.moveDown(1.5);
    };

    addSection('SEO分析', result.seo);
    addSection('UX/UI分析', result.ux);
    addSection('コンバージョン改善', result.conversion);
    addSection('強み', result.strengths);
    addSection('弱み', result.weaknesses);
    addSection('改善提案リスト', result.improvement);

    doc.end();

    const pdfBuffer = await pdfPromise;
    const base64PDF = pdfBuffer.toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=website_report.pdf',
        'Access-Control-Allow-Origin': '*',
      },
      body: base64PDF,
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};

export { handler };
