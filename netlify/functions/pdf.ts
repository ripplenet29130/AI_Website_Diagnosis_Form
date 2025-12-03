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
    const body = JSON.parse(event.body || '{}');
    const raw = body.result;

    if (!raw) {
      return { statusCode: 400, body: 'Missing result' };
    }

    // -------- normalize --------
    const normalize = (v: any): string => {
      if (!v) return "";
      if (Array.isArray(v)) return v.join("\n");
      if (typeof v === "object") return JSON.stringify(v, null, 2);
      return String(v);
    };

    // 正しい result を作る（上書き禁止）
    const result = {
      seo: normalize(raw.seo),
      ux: normalize(raw.ux),
      conversion: normalize(raw.conversion),
      strengths: normalize(raw.strengths),
      weaknesses: normalize(raw.weaknesses),
      improvement: normalize(raw.improvement),
    };

    // -------- フォント読み込み --------
    const fontPath = path.join(
      process.cwd(),
      "netlify",
      "functions",
      "fonts",
      "NotoSansJP-Regular.ttf"
    );
    const fontBytes = fs.readFileSync(fontPath);

    // PDF作成
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBytes);
    
    let page = pdfDoc.addPage([595, 842]); // A4
    let y = 780;
    const fontSize = 12;
    
    // ---- 新しいページを作る ----
    const newPage = () => {
      page = pdfDoc.addPage([595, 842]);
      y = 780;
    };
    
    // ---- 見出し＋本文を書く ----
    const write = (title: string, text: string) => {
      const safeText = String(text);
      const lines = safeText.split("\n");
    
      // 見出し
      page.drawText(title, {
        x: 50,
        y,
        size: 16,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    
      y -= 30;
    
    for (const rawLine of lines) {
      if (y < 60) newPage();
    
      // 行頭の「・」「•」を削除
      const line = rawLine.replace(/^・+/, "").replace(/^•+/, "").trim();
    
      page.drawText(`• ${line}`, {
        x: 70,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    
      y -= 18;
    }

    
      y -= 16; // セクション間の余白
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
  } catch (e) {
    console.error("PDF日本語エラー", e);
    return { statusCode: 500, body: "PDF日本語エラー" };
  }
};
