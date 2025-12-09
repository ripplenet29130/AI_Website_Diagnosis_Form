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

    // ========== HTML 取得 ==========
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

    // ========== LLMs.txt ==========
    let llmsInstalled = false;
    try {
      const res = await fetch(llmsUrl);
      if (res.status === 200) llmsInstalled = true;
    } catch {}
    if (!llmsInstalled) {
      score -= 30;
      issues.push("LLMs.txtが未設置です");
      improve.push(
        "LLMs.txtを設置し、AI検索に対してコンテンツの公開範囲を明確にしましょう"
      );
    } else {
      done.push("LLMs.txtが設置されています");
    }

    // ========== robots.txt ==========
    let robotsInstalled = false;
    try {
      const res = await fetch(robotsUrl);
      if (res.status === 200) robotsInstalled = true;
    } catch {}
    if (!robotsInstalled) {
      score -= 10;
      issues.push("robots.txtが未設定です");
      improve.push(
        "robots.txtを設置して、AIクローラーや検索エンジンの巡回を適切に制御しましょう"
      );
    } else {
      done.push("robots.txtが設定されています");
    }

    // ========== sitemap.xml ==========
    let sitemapInstalled = false;
    try {
      const res = await fetch(sitemapUrl);
      if (res.status === 200) sitemapInstalled = true;
    } catch {}
    if (!sitemapInstalled) {
      score -= 10;
      issues.push("sitemap.xmlが見つかりません");
      improve.push(
        "sitemap.xmlを設置し、重要なページ構造を検索エンジンやAIクローラーに伝えましょう"
      );
    } else {
      done.push("sitemap.xmlが登録されています");
    }

    // ========== HTTPS ==========
    if (!target.startsWith("https://")) {
      score -= 10;
      issues.push("HTTPS通信に対応していません");
      improve.push(
        "SSL対応を行い、ユーザーと検索エンジンの両方から信頼されるサイトにしましょう"
      );
    } else {
      done.push("HTTPS通信に対応済みです");
    }

    // ========== JSON-LD（構造化データ） ==========
    const hasJsonLD = html.includes("application/ld+json");
    if (!hasJsonLD) {
      score -= 20;
      issues.push("構造化データ（JSON-LD）が未設定です");
      improve.push(
        "構造化データ（JSON-LD）を追加し、AIにページ内容の意味を正確に伝えましょう"
      );
    } else {
      done.push("構造化データ（JSON-LD）が利用されています");
    }

    // ========== favicon ==========
    const hasFavicon =
      html.includes('rel="icon"') ||
      html.includes("rel='icon'") ||
      html.includes("rel=\"shortcut icon\"") ||
      html.includes("rel='shortcut icon'") ||
      html.toLowerCase().includes("favicon.ico");

    if (!hasFavicon) {
      score -= 5;
      issues.push("faviconが未設定です");
      improve.push(
        "faviconを設定し、ブラウザや検索結果でのブランド認知を高めましょう"
      );
    } else {
      done.push("faviconが設定されています");
    }

    // ========== コンテンツ量 ==========
    // 1万文字未満なら減点（配点15）
    if (html.length < 10000) {
      score -= 15;
      issues.push("コンテンツ量が少なく、AIが十分に学習・引用しにくい状態です");
      improve.push(
        "専門性の高いコンテンツを増やし、AIに参照されやすい情報量を確保しましょう"
      );
    } else {
      done.push("コンテンツ量が十分で、AIに引用されやすい土台があります");
    }

    // スコアは 0〜100 に丸める
    score = Math.max(0, Math.min(100, score));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: true,
        score,
        done,
        issues,
        improve,
      }),
    };
  } catch (e) {
    console.error("Unexpected error:", e);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: false,
        error: "サーバー側でエラーが発生しました",
      }),
    };
  }
};
