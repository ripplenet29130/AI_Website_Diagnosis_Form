// netlify/functions/analyze.ts
import type { Handler } from "@netlify/functions";

interface IssueItem {
  title: string;
  summary: string;
  why: string[];
  risks: string[];
}

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
    const issues: IssueItem[] = [];
    const improve: string[] = [];

    const llmsUrl = `${target}/llms.txt`;
    const robotsUrl = `${target}/robots.txt`;
    const sitemapUrl = `${target}/sitemap.xml`;

    // ========== HTML取得 ==========
    let html = "";
    try {
      const res = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0" } });
      html = await res.text();
    } catch {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          success: false,
          error: "サイト情報を取得できませんでした",
        }),
      };
    }

    // ----------------------------------------------------
    // ① LLMs.txt
    // ----------------------------------------------------
    let llmsInstalled = false;
    try {
      const res = await fetch(llmsUrl);
      if (res.status === 200) llmsInstalled = true;
    } catch {}

    if (!llmsInstalled) {
      score -= 30;
      issues.push({
        title: "LLMs.txt が未設置です",
        summary:
          "LLMs.txt は、AIに「どのページを見てよいか」を伝えるための重要なファイルです。これが無いと、AI があなたのサイトを正しく理解できません。",
        why: [
          "AI がサイト内容を誤認し、紹介されにくくなる",
        ],
        risks: [
          "AI（Bing/Google/ChatGPT）が内容をほぼ拾わない",
          "見せたくないページまで AI に見られる可能性がある",
          "ライバルだけが AI に取り上げられて差がつく",
        ],
      });

      improve.push("LLMs.txtを設置し、AIに参照してほしいページを明確に伝えましょう。");
    } else {
      done.push("LLMs.txtが設置されています");
    }

    // ----------------------------------------------------
    // ② robots.txt
    // ----------------------------------------------------
    let robotsInstalled = false;
    try {
      const res = await fetch(robotsUrl);
      if (res.status === 200) robotsInstalled = true;
    } catch {}

    if (!robotsInstalled) {
      score -= 10;

      issues.push({
        title: "robots.txt が未設定です",
        summary:
          "robots.txt は、AI や検索エンジンに「どのページをクロールしてよいか」を伝える設定ファイルです。これが無いと、AI がサイト全体を正しく巡回できません。",
        why: [
          "重要ページを AI が見落とし、正しく評価されなくなる",
        ],
        risks: [
          "不要なページばかりクロールされる可能性がある",
          "重要ページが AI に見てもらえず、評価されない",
          "AI検索での露出が安定しない",
        ],
      });

      improve.push("robots.txt を設置して、クロール制御を適切に行いましょう。");
    } else {
      done.push("robots.txtが設定されています");
    }

    // ----------------------------------------------------
    // ③ sitemap.xml
    // ----------------------------------------------------
    let sitemapInstalled = false;
    try {
      const res = await fetch(sitemapUrl);
      if (res.status === 200) sitemapInstalled = true;
    } catch {}

    if (!sitemapInstalled) {
      score -= 10;

      issues.push({
        title: "sitemap.xml が未設置です",
        summary:
          "sitemap.xml は、サイト内のページ構造を AI や検索エンジンに伝える地図のようなものです。これが無いと、AI が重要なページを発見しづらくなります。",
        why: [
          "AI が全ページを把握できず、内容が評価されにくい",
        ],
        risks: [
          "新しいページが AI に認識されるのが遅れる",
          "重要ページが AI に理解されず、検索露出が低下する",
          "ライバルサイトとの差が広がる可能性がある",
        ],
      });

      improve.push("sitemap.xml を設置し、AIにページ構造を正しく伝えましょう。");
    } else {
      done.push("sitemap.xmlが登録されています");
    }

    // ----------------------------------------------------
    // ④ HTTPS
    // ----------------------------------------------------
    if (!target.startsWith("https://")) {
      score -= 10;

      issues.push({
        title: "HTTPS（SSL）が未対応です",
        summary:
          "HTTPS は、通信を暗号化して安全にする仕組みです。未対応だと、AI や検索エンジンから「安全でないサイト」と判断されます。",
        why: [
          "ユーザーと AI の両方から信用されにくくなる",
        ],
        risks: [
          "AI がコンテンツを優先的に扱ってくれない",
          "ブラウザ警告でユーザー離脱が増える",
          "検索順位が下がる可能性がある",
        ],
      });

      improve.push("HTTPS（SSL対応）を行い、安全で信頼されるサイトに整えましょう。");
    } else {
      done.push("HTTPS通信に対応済みです");
    }

    // ----------------------------------------------------
    // ⑤ JSON-LD
    // ----------------------------------------------------
    const hasJsonLD = html.includes("application/ld+json");

    if (!hasJsonLD) {
      score -= 20;

      issues.push({
        title: "構造化データ（JSON-LD）が未設定です",
        summary:
          "JSON-LD は、AI に「このページは何について書かれているか」を正確に伝えるためのデータです。未設定だと、AI が内容を深く理解できません。",
        why: [
          "AI がページ内容を正しく把握できず、紹介・引用されにくい",
        ],
        risks: [
          "AI検索でライバルに負けやすくなる",
          "専門性が正しく認識されない",
          "リッチリザルトに表示されず、クリック率が下がる",
        ],
      });

      improve.push("JSON-LD を追加し、ページの内容を AI に正確に伝えましょう。");
    } else {
      done.push("構造化データ（JSON-LD）が利用されています");
    }

    // ----------------------------------------------------
    // ⑥ Favicon
    // ----------------------------------------------------
    const hasFavicon =
      html.includes('rel="icon"') ||
      html.includes("rel='icon'") ||
      html.includes('rel="shortcut icon"') ||
      html.includes("rel='shortcut icon'") ||
      html.toLowerCase().includes("favicon.ico");

    if (!hasFavicon) {
      score -= 5;

      issues.push({
        title: "favicon が未設定です",
        summary:
          "favicon は、検索結果やブラウザで表示されるサイトのアイコンです。ブランド認知を高め、視覚的に識別されやすくします。",
        why: [
          "AI やユーザーに覚えてもらいにくい",
        ],
        risks: [
          "検索結果でサイトが埋もれやすくなる",
          "ブランドとしての信頼感が損なわれる",
        ],
      });

      improve.push("favicon を設定し、サイトの信頼性と認知度を高めましょう。");
    } else {
      done.push("faviconが設定されています");
    }

    // ----------------------------------------------------
    // ⑦ コンテンツ量
    // ----------------------------------------------------
    if (html.length < 10000) {
      score -= 15;

      issues.push({
        title: "コンテンツ量が不足しています",
        summary:
          "AI は情報量の多いサイトを「信頼できる情報源」として扱います。ページ全体の文章量が少ないと、AI が学習しづらくなります。",
        why: [
          "AI が内容を十分に理解できず、引用されにくい",
        ],
        risks: [
          "AI検索で重要キーワードに表示されにくくなる",
          "専門性が伝わらず、競合に負けやすくなる",
        ],
      });

      improve.push("専門性の高いコンテンツを増やし、AIに評価されやすい情報量を確保しましょう。");
    } else {
      done.push("コンテンツ量が十分で、AIに引用されやすい土台があります");
    }

    // ==============================
    // スコア丸め
    // ==============================
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
