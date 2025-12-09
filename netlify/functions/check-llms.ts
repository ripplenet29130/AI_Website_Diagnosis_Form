import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {

  const { url } = JSON.parse(event.body || "{}");

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "URL is required" }),
    };
  }

  const llmsUrl = `${url.replace(/\/$/, "")}/llms.txt`;

  let llmsStatus = "not_installed";

  try {
    const res = await fetch(llmsUrl);
    if (res.status === 200) llmsStatus = "installed";
  } catch (e) {
    llmsStatus = "error";
  }

  // 仮の仮で固定（後でAI差し替え）
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      llms: llmsStatus,
      score: "C",
      issues: [
        "LLMs.txtが未設置",
        "構造化データが不足",
        "metaがAI向けに最適化されていない",
      ],
      suggestions: [
        "LLMs.txt設置",
        "構造化データ実装",
        "CV導線改善",
      ],
    }),
  };
};
