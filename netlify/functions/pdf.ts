import { Handler } from '@netlify/functions';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from 'fontkit';
import fs from 'fs';
import path from 'path';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { result } = JSON.parse(event.body || '{}');
    if (!result) {
      return { statusCode: 400, body: "Missing result" };
    }

    // 🔥 日本語フォントのパス（Netlifyに確実に存在する）
    const fontPath = path.join(
      process.cwd(),
      "netlify",
      "functions",
      "fonts",
      "NotoSansJP-Regular.ttf"
    );

    const fontBytes = fs.readFileSync(fontPath);

    // 🔥 PDF 作成と fontkit 登録
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit); // ← これが必須！

    const font = await pdfDoc.embedFont(fontBytes);
    const page = pdfDoc.addPage([595, 842]); // A4縦

    let y = 780;

    const write = (title: string, text: string) => {
      page.drawText(title, {
        x: 50,
        y,
        size: 18,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 28;

      const lines = text.split('\n').filter(l => l.trim());
      lines.forEach((line) => {
        page.drawText(`・${line.replace(/^・/, '')}`, {
          x: 70,
          y,
          size: 12,
          font,
        });
        y -= 18;

        if (y < 60) {
          y = 780;
          pdfDoc.addPage([595, 842]);
        }
      });

      y -= 18;
    };

    write("SEO分析", result.seo);
    write("UX/UI分析", result.ux);
    write("コンバージョン改善", result.conversion);
    write("強み", result.strengths);
    write("弱み", result.weaknesses);
    write("改善提案リスト", result.improvement);

    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=website_report.pdf",
        "Access-Control-Allow-Origin": "*",
      },
      body: base64,
      isBase64Encoded: true,
    };

  } catch (err) {
    console.error("PDF日本語エラー", err);
    return {
      statusCode: 500,
      body: "PDF error",
    };
  }
};
