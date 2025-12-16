// netlify/functions/analyze.ts
import type { Handler } from "@netlify/functions";

interface IssueItem {
  title: string;
  summary: string;
  why: string[];
  risks: string[];
}

interface ImproveItem {
  title: string;
  summary: string;
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
    const improve: ImproveItem[] = [];

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
      score -= 35;
      issues.push({
        title: "LLMs.txt が未設置です",
        summary:
          "LLMs.txt は、AIに「どのページを見てよいか」を伝えるための重要なファイルです。これが無いと、AI があなたのサイトを正しく理解できません。",
        why: ["AI がサイト内容を誤認し、紹介されにくくなる"],
        risks: [
          "AI（Bing/Google/ChatGPT）が内容をほぼ拾わない",
          "見せたくないページまで AI に見られる可能性がある",
          "ライバルだけが AI に取り上げられて差がつく",
        ],
      });

      improve.push({
        title: "LLMs.txtを設置して、AIに正しい情報を伝えましょう",
        summary:
          "LLMs.txt を設置することで、AI に “サイトのどの部分を参照してよいか” を正しく伝えられるようになります。AI検索で情報が拾われやすくなり、サイトの露出アップにつながります。",
      });
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
      score -= 15;

      issues.push({
        title: "robots.txt が未設定です",
        summary:
          "robots.txt は、AI や検索エンジンに「どのページをクロールしてよいか」を伝える設定ファイルです。これが無いと、AI がサイト全体を正しく巡回できません。",
        why: ["重要ページを AI が見落とし、正しく評価されなくなる"],
        risks: [
          "不要なページばかりクロールされる可能性がある",
          "重要ページが AI に見てもらえない",
          "AI検索での露出が安定しない",
        ],
      });

      improve.push({
        title: "robots.txt を設定して、AIに巡回ルールを伝えましょう",
        summary:
          "robots.txt を設定すると、AI や検索エンジンに「見てよいページ／見てはいけないページ」を明確に伝えられます。重要なページをしっかり評価してもらいやすくなり、SEO の土台が整います。",
      });
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
      score -= 15;

      issues.push({
        title: "sitemap.xml が未設置です",
        summary:
          "sitemap.xml は、サイト内のページ構造を AI や検索エンジンに伝える地図のようなものです。これが無いと、AI が重要なページを発見しづらくなります。",
        why: ["AI が全ページを把握できず、内容が評価されにくい"],
        risks: [
          "新しいページが認識されるのが遅れる",
          "重要ページの検索露出が低下する",
          "競合との差が広がりやすい",
        ],
      });

      improve.push({
        title: "sitemap.xmlを用意して、AIが全ページを正しく把握できるようにしましょう",
        summary:
          "sitemap.xml を設置すると、サイト内のページを確実に AI・検索エンジンへ届けられるようになります。新しいページもすぐ認識され、集客効果が安定して高まります。",
      });
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
          "HTTPS は、通信を暗号化して安全にする仕組みです。未対応だと、AI や検索エンジンから安全でないと判断されます。",
        why: ["ユーザーと AI の両方から信頼されにくくなる"],
        risks: [
          "AI がコンテンツを優先的に扱わない",
          "ブラウザ警告でユーザー離脱が増える",
          "検索順位が下がるリスクが高まる",
        ],
      });

      improve.push({
        title: "HTTPSを有効化して、AIとユーザーに安全なサイトであることを伝えましょう",
        summary:
          "SSL 対応を行うことで、ブラウザにも AI にも「安全なサイト」と判断されるようになります。ユーザーの信頼性が上がり、検索評価の改善にも直結します。",
      });
    } else {
      done.push("HTTPS通信に対応済みです");
    }

    // ----------------------------------------------------
    // ⑤ JSON-LD
    // ----------------------------------------------------
    const hasJsonLD = html.includes("application/ld+json");

    if (!hasJsonLD) {
      score -= 25;

      issues.push({
        title: "構造化データ（JSON-LD）が未設定です",
        summary:
          "JSON-LD は、AI にページ内容を正確に伝える重要なデータ形式です。未設定だと、AI が内容を深く理解できません。",
        why: ["ページ内容を正しく理解してもらえず、引用されにくい"],
        risks: [
          "AI検索で競合に負けやすい",
          "専門性が正しく伝わらない",
          "リッチリザルトに表示されずクリック率が落ちる",
        ],
      });

      improve.push({
        title: "JSON-LDを追加して、AIにページ内容を正しく伝えましょう",
        summary:
          "構造化データ（JSON-LD）を追加することで、AI にページの内容を正しく理解させることができます。その結果、AI検索やGoogleの強調表示で取り上げられやすくなります。",
      });
    } else {
      done.push("構造化データ（JSON-LD）が利用されています");
    }


    // スコア丸め
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
