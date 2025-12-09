import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const { url } = JSON.parse(event.body || "{}");

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "URL is required" }),
    };
  }

  const cleanUrl = url.replace(/\/$/, ""); // 末尾の / を除去

  const checkFile = async (path: string) => {
    try {
      const res = await fetch(`${cleanUrl}/${path}`);
      return res.status === 200;
    } catch {
      return false;
    }
  };

  const result = {
    https: cleanUrl.startsWith("https://"),
    llms: await checkFile("llms.txt"),
    robots: await checkFile("robots.txt"),
    sitemap: await checkFile("sitemap.xml"),
    favicon: await checkFile("favicon.ico"),
    structured: false,
    contentLength: 0,
  };

  // HTML解析（構造化データ＆文字量）
  try {
    const res = await fetch(cleanUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    result.contentLength = html.length;
    result.structured = html.includes("application/ld+json");
  } catch (e) {
    console.error("HTML fetch error", e);
  }

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      success: true,
      score: "B",
      techCheck: {
        https: result.https,
        llms: result.llms,
        robots: result.robots,
        sitemap: result.sitemap,
        structured: result.structured,
        favicon: result.favicon,
        contentLength: result.contentLength,
      },
      message: "Technical check completed",
    }),
  };
};
