import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const { url } = JSON.parse(event.body || "{}");

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "URL is required" }),
    };
  }

  const target = url.replace(/\/$/, "");
  let score = 100;
  const issues: string[] = [];
  const done: string[] = [];
  const improve: string[] = [];

  // ==========================
  // チェック対象URL
  // ==========================
  const llmsUrl = `${target}/llms.txt`;
  const robotsUrl = `${target}/robots.txt`;
  const sitemapUrl = `${target}/sitemap.xml`;
  
  // ==========================
  // HTML取得
  // ==========================
  let html = "";
  try {
    const res = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0" } });
    html = await res.text();
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "サイト情報を取得できませんでした" }) };
  }

  // ==========================
  // llms.txt
  // ==========================
  let llmsInstalled = false;
  try {
    const res = await fetch(llmsUrl);
    if (res.status === 200) llmsInstalled = true;
  } catch {}
  if (!llmsInstalled) {
    score -= 30;
    issues.push("LLMs.txtが未設置です");
    improve.push("LLMs.txtを設置し、AI検索に対してコンテンツの公開範囲を明確にしましょう");
  } else {
    done.push("LLMs.txtが設置されています");
  }

  // ==========================
  // robots.txt
  // ==========================
  let robotsInstalled = false;
  try {
    const res = await fetch(robotsUrl);
    if (res.status === 200) robotsInstalled = true;
  } catch {}
  if (!robotsInstalled) {
    score -= 10;
    issues.push("robots.txtが未設定です");
    improve.push("robots.txtを設置してAIクローラー制御を行いましょう");
  } else {
    done.push("robots.txtが設定されています");
  }

  // ==========================
  // sitemap.xml
  // ==========================
  let sitemapInstalled = false;
  try {
    const res = await fetch(sitemapUrl);
    if (res.status === 200) sitemapInstalled = true;
  } catch {}
  if (!sitemapInstalled) {
    score -= 10;
    issues.push("sitemap.xmlが見つかりません");
    improve.push("sitemap.xmlを設置し検索エンジンに必要なページ構造を提供しましょう");
  } else {
    done.push("sitemap.xmlが登録されています");
  }

  // ==========================
  // HTTPS
  // ==========================
  if (!target.startsWith("https://")) {
    score -= 10;
    issues.push("HTTPS通信に対応していません");
    improve.push("SSL対応を行い、安全な情報通信環境を整えましょう");
  } else {
    done.push("HTTPS通信に対応済みです");
  }

  // ==========================
  // JSON-LD
  // ==========================
  const hasJsonLD = html.includes("application/ld+json");
  if (!hasJsonLD) {
    score -= 20;
    issues.push("構造化データ（JSON-LD）が未設定です");
    improve.push("構造化データを追加してAIに内容を正確に伝えましょう");
  } else {
    done.push("構造化データ（JSON-LD）が利用されています");
  }

  // ==========================
  // favicon
  // ==========================
  const hasFavicon = html.includes("rel=\"icon\"") || html.includes("rel=\"shortcut icon\"");
  if (!hasFavicon) {
    score -= 5;
    issues.push("faviconが未設定です");
    improve.push("faviconを設定し、ブランド認知の一貫性を高めましょう");
  } else {
    done.push("faviconが設定されています");
  }

  // ==========================
  // コンテンツ量（暫定：6,000文字以下で減点）
  // ==========================
  if (html.length < 6000) {
    score -= 15;
    issues.push("コンテンツ量が少なく、AIが理解しにくい状況です");
    improve.push("専門性の高い記事を増やし、AI評価と検索導線を改善しましょう");
  } else {
    done.push("コンテンツ量が十分でAI引用されやすい土台があります");
  }

  // ==========================
  // 返却
  // ==========================
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      score,
      done,
      issues,
      improve,
    }),
  };
};
