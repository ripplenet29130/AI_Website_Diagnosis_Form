// netlify/functions/analyze.ts
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    const { url } = JSON.parse(event.body || "{}");

    if (!url) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: false, error: "URL is required" }),
      };
    }

    const target = url.replace(/\/$/, "");

    let score = 100;
    const done: string[] = [];
    const issues: string[] = [];
    const improve: string[] = [];

    const llmsUrl = `${target}/llms.txt`;
    const robotsUrl = `${target}/robots.txt`;
    const sitemapUrl = `${target}/sitemap.xml`;

    // ========== HTML取得 ==========
    let html = "";
    try {
      const res = await fetch(target, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      html = await res.text();
    } catch (e) {
      console.error("HTML fetch error:", e);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          success: false,
          error: "サイト情報を取得できませんでした",
        }),
      };
    }

    // ==========================================
    // 🟥 ① LLMs.txt
    // ==========================================
    let llmsInstalled = false;
    try {
      const res = await fetch(llmsUrl);
      if (res.status === 200) llmsInstalled = true;
    } catch {}

    if (!llmsInstalled) {
      score -= 30;

      issues.push(
        "LLMs.txt がないため、AI に「どのページを見てもいいのか」が伝わっていません。\n" +
          "その結果、あなたのサイトの内容が AI に正しく読まれず、紹介されにくくなっています。\n\n" +
          "🔧 放置するとどうなる？\n" +
          "・AI（Bing・Google・ChatGPT など）がサイト内容をほぼ拾ってくれない\n" +
          "・本来見せたくないページまで AI に見られる可能性がある\n" +
          "・ライバルだけが AI に取り上げられて差がつく"
      );

      improve.push(
        "LLMs.txt を設置することで、AI に参照してよいページを正しく伝えられます。AI検索でサイト情報を拾ってもらいやすくなり、露出アップにつながります。"
      );
    } else {
      done.push("LLMs.txt が設置されています");
    }

    // ==========================================
    // 🟥 ② robots.txt
    // ==========================================
    let robotsInstalled = false;
    try {
      const res = await fetch(robotsUrl);
      if (res.status === 200) robotsInstalled = true;
    } catch {}

    if (!robotsInstalled) {
      score -= 10;

      issues.push(
        "robots.txt がないため、検索エンジンや AI が「見てよい／見てはいけない」ページを判断できません。重要なページが正しく評価されない可能性があります。\n\n" +
          "🔧 放置するとどうなる？\n" +
          "・必要なページが検索に出てこないことがある\n" +
          "・管理画面など “見せたくない部分” が読み取られる危険がある\n" +
          "・AI が正しい情報を把握できず、競合と差が開く"
      );

      improve.push(
        "robots.txt を設置すると、AI や検索エンジンがサイトを正しく巡回できるようになります。重要なページが適切に評価され、SEO の基盤も整います。"
      );
    } else {
      done.push("robots.txt が設定されています");
    }

    // ==========================================
    // 🟥 ③ sitemap.xml
    // ==========================================
    let sitemapInstalled = false;
    try {
      const res = await fetch(sitemapUrl);
      if (res.status === 200) sitemapInstalled = true;
    } catch {}

    if (!sitemapInstalled) {
      score -= 10;

      issues.push(
        "sitemap.xml（サイトの地図）がないため、AI や検索エンジンがページを見つけにくい状態です。大事なページが気づかれず、正しく評価されません。\n\n" +
          "🔧 放置するとどうなる？\n" +
          "・新しいページが検索や AI に認識されない\n" +
          "・サイト全体の構造が正しく伝わらず評価が上がらない\n" +
          "・ライバルサイトより検索順位が下がる"
      );

      improve.push(
        "sitemap.xml を設置することで、AI・Google にサイト内の全ページを正しく届けられます。重要なページが確実に認識され、集客効果が高まります。"
      );
    } else {
      done.push("sitemap.xml が登録されています");
    }

    // ==========================================
    // 🟥 ④ HTTPS（SSL）
    // ==========================================
    if (!target.startsWith("https://")) {
      score -= 10;

      issues.push(
        "HTTPS（SSL）が未対応のため、ブラウザで「安全ではありません」と表示される場合があります。AI にも信頼性の低いサイトと判断されます。\n\n" +
          "🔧 放置するとどうなる？\n" +
          "・ユーザーが不安になり離脱しやすくなる\n" +
          "・Google や AI の評価が下がる\n" +
          "・問い合わせや購入などのアクション率が落ちる"
      );

      improve.push(
        "SSL 対応を行うことで、ユーザーにも AI にも『安全なサイト』として判断されます。信頼性が向上し、検索評価にも良い影響があります。"
      );
    } else {
      done.push("HTTPS通信に対応済みです");
    }

    // ==========================================
    // 🟥 ⑤ JSON-LD（構造化データ）
    /
