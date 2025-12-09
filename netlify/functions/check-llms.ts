import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {

  // Preflight (OPTIONS)
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
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { url } = JSON.parse(event.body || "{}");

  if (!url) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "URL is required" }),
    };
  }

  const llmsUrl = `${url.replace(/\/$/, "")}/llms.txt`;

  let llmsStatus = "not_installed";

  try {
    // timeout付きfetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(llmsUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.status === 200) {
      llmsStatus = "installed";
    }

  } catch (e) {
    llmsStatus = "error";
  }

  // ---- スコア判定ロジック ----
  let score = "C";
  if (llmsStatus === "installed") score = "B";

  // ---- 仮の診断結果（後でAIに差し替え） ----
  const issues = [
    llmsStatus === "not_installed" && "LLMs.txtが未設置",
    "構造化データが不足",
    "metaがAI向けに最適化されていない",
  ].filter(Boolean) as string[];

  const suggestions = [
    llmsStatus === "not_installed" && "LLMs.txt設置",
    "構造化データ実装",
    "CV導線改善",
  ].filter(Boolean) as string[];

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify({
      llms: llmsStatus,
      score,
      issues,
      suggestions,
    }),
  };
};
