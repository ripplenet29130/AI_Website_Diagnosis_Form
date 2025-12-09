import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const { url } = JSON.parse(event.body || "{}");

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "URL is required" }),
    };
  }

  const cleanUrl = url.replace(/\/$/, "");

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

  try {
    const res = await fetch(cleanUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await res.text();
    result.contentLength = html.length;
    result.structured = html.includes("application/ld+json");
  } catch {}

  const score =
    (result.https ? 10 : 0) +
    (result.llms ? 10 : 0) +
    (result.robots ? 15 : 0) +
    (result.sitemap ? 15 : 0) +
    (result.structured ? 15 : 0) +
    (result.favicon ? 5 : 0) +
    Math.min(result.contentLength / 10000, 1) * 30;

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      success: true,
      score: Math.round(score),
      techCheck: result,
    }),
  };
};
