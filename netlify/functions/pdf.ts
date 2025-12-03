import { Handler } from "@netlify/functions";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export const handler: Handler = async (event) => {
  try {
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
      return { statusCode: 405, body: "Method not allowed" };
    }

    const body = JSON.parse(event.body || "{}");
    const result = body.result;

    if (!result) {
      return { statusCode: 400, body: "Missing result" };
    }

    // 日本語フォントを読み込む
    const fontPath = path.join(
    process.cwd(),
    "netlify",
    "functions",
    "fonts",
    "NotoSansJP-Regular.ttf"
    );
    const fontBytes = fs.readFileSync(fontPath);

    // PDF 作成
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage([595, 842]);
    let y = 780;

    const write = (title: string, text: string) => {
      page.drawText(title, {
        x: 50,
        y,
        size: 18,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 30;

      const lines = text.split("\n");
      lines.forEach((line) => {
        page.drawText("・" + line.trim(), {
          x: 70,
          y,
          size: 12,
          font,
        });
        y -= 20;

        if (y < 60) {
          y = 780;
          pdfDoc.addPage([595, 842]);
        }
      });
      y -= 10;
    };

    write("SEO分析", result.seo);
    write("UX/UI分析", result.ux);
    write("コンバージョン改善", result.conversion);
    write("強み", result.strengths);
    write("弱み", result.weaknesses);
    write("改善提案", result.improvement);

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
    return { statusCode: 500, body: "PDF error" };
  }
};
