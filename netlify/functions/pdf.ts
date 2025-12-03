import { Handler } from '@netlify/functions';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface AnalysisResult {
  seo: string;
  ux: string;
  conversion: string;
  strengths: string;
  weaknesses: string;
  improvement: string;
}

export const handler: Handler = async (event) => {
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
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const bodyData = JSON.parse(event.body || '{}');
    const raw = bodyData.result;
    
    if (!raw) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Result data is required' }),
      };
    }
    
    const normalize = (v: any) => {
      if (!v) return "";
      if (Array.isArray(v)) return v.join("\n");
      if (typeof v === "object") return JSON.stringify(v, null, 2);
      return String(v);
    };
    
    const result = {
      seo: normalize(raw.seo),
      ux: normalize(raw.ux),
      conversion: normalize(raw.conversion),
      strengths: normalize(raw.strengths),
      weaknesses: normalize(raw.weaknesses),
      improvement: normalize(raw.improvement),
    };
    
    const { result } = JSON.parse(event.body || '{}') as { result: AnalysisResult };
    if (!result) {
      return { statusCode: 400, body: 'result missing' };
    }

    // PDF 作成開始
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width } = page.getSize();
    const fontSize = 12;
    let y = 780;

    const write = (title: string, text: string) => {
      const lines = text.split('\n').filter((l) => l.trim().length > 0);

      page.drawText(title, {
        x: 50,
        y,
        size: 16,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 25;

      lines.forEach((line) => {
        page.drawText(`• ${line.replace(/^・/, '')}`, {
          x: 70,
          y,
          size: fontSize,
          font,
        });
        y -= 18;

        if (y < 60) {
          y = 780;
          pdfDoc.addPage([595, 842]);
        }
      });

      y -= 20;
    };

    write('SEO分析', result.seo);
    write('UX/UI分析', result.ux);
    write('コンバージョン改善', result.conversion);
    write('強み', result.strengths);
    write('弱み', result.weaknesses);
    write('改善提案リスト', result.improvement);

    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=website_report.pdf',
        'Access-Control-Allow-Origin': '*',
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (e) {
    console.error('PDF error', e);
    return {
      statusCode: 500,
      body: 'PDF error',
    };
  }
};
