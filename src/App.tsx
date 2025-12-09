import { useState } from "react";
import { Loader2 } from "lucide-react";

interface TechCheckResult {
  https: boolean;
  llms: boolean;
  robots: boolean;
  sitemap: boolean;
  structured: boolean;
  favicon: boolean;
  contentLength: number;
}

interface AnalyzeResponse {
  success: boolean;
  score: number;
  techCheck: TechCheckResult;
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState("");

  const NETLIFY_API = "https://ai-website-diagnosis-form.netlify.app/.netlify/functions";

  /** --------------------------
   * 定型文メッセージ生成
   ----------------------------*/
  const generateSummary = (data: AnalyzeResponse) => {
    const r = data.techCheck;
    const positives = [
      r.https && "HTTPS対応済み",
      r.robots && "robots.txt設定済み",
      r.sitemap && "sitemap.xml登録済み",
      r.favicon && "favicon設定済み",
      !r.structured && r.contentLength > 8000 && "コンテンツ量は一定確保されています",
    ].filter(Boolean);

    const issues = [
      !r.llms && "LLMs.txtが未設定です",
      !r.structured && "構造化データが不足しています（JSON-LD）",
      r.contentLength < 8000 && "ページコンテンツ量が少なく検索評価が上がりにくい状態です",
    ].filter(Boolean);

    const suggestions = [
      "LLMs.txtの設置を行いましょう（AI検索最適化）",
      "構造化データ(JSON-LD)を追加し検索エンジンに内容を正確に伝えましょう",
      "コンテンツ量を増やし、検索評価とCV導線を改善しましょう",
    ];

    return { positives, issues, suggestions };
  };

  /** --------------------------
   * サブミット
   ----------------------------*/
  const handleSubmit = async () => {
    if (!inputUrl) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${NETLIFY_API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });

      const json = await res.json();
      if (!json.success) throw new Error("診断に失敗しました");

      setResult(json);

    } catch (err: any) {
      setError(err.message || "通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* URLフォーム */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-gray-800">AIサイト診断</h2>
          <p className="text-sm text-gray-500">URLを入力して診断を開始してください</p>

          <input
            type="text"
            placeholder="https://example.com"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            診断を開始する
          </button>
        </div>

        {/* エラー */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* ローディング */}
        {isLoading && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">サイトを分析中です...</p>
          </div>
        )}

        {/* 結果表示 */}
        {result && !isLoading && (
          <div className="space-y-6">
            {/* スコアカード */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-blue-500">
              <h3 className="text-xl font-bold mb-2">📊 診断スコア</h3>
              <p className="text-3xl font-black">{result.score} / 100</p>
              <p className="text-gray-600">
                {result.score >= 90 ? "非常に優秀です" :
                 result.score >= 75 ? "良好な状態です" :
                 result.score >= 60 ? "改善の余地があります" : "早急な改善を推奨します"}
              </p>
            </div>

            {/* ポジティブ */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-green-500">
              <h3 className="text-lg font-bold mb-2">🟩 できている点</h3>
              <ul className="list-disc ml-6 space-y-1 text-gray-800">
                {generateSummary(result).positives.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {/* 課題 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-red-500">
              <h3 className="text-lg font-bold mb-2">🟥 課題点</h3>
              <ul className="list-disc ml-6 space-y-1 text-gray-800">
                {generateSummary(result).issues.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {/* 改善提案 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-yellow-500">
              <h3 className="text-lg font-bold mb-2">💡 改善提案</h3>
              <ul className="list-disc ml-6 space-y-1 text-gray-800">
                {generateSummary(result).suggestions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
