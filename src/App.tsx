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
   * 診断コメント生成（AI対策視点）
   ----------------------------*/
  const generateSummary = (data: AnalyzeResponse) => {
    const r = data.techCheck;

    const positives = [
      r.https && "HTTPS通信に対応しており、情報信頼性が確保されています",
      r.robots && "robots.txtが設定されており、AIクローラー制御ができています",
      r.sitemap && "sitemap.xmlが登録されており、AI検索に必要なページ構造が提供されています",
      r.favicon && "faviconが設定されており、ブランド認知の一貫性に寄与しています",
      r.structured && "構造化データ(JSON-LD)が利用されており、AIへの理解が向上しています",
      r.contentLength >= 10000 && "コンテンツ量が十分で、AIが引用しやすい土台があります",
    ].filter(Boolean);

    const issues = [
      !r.llms && "LLMs.txtが未設定のため、AIクローラーが情報を正しく取得できません",
      !r.structured && "構造化データ(JSON-LD)が不足しており、AIが内容を理解しづらい状態です",
      r.contentLength < 10000 && "コンテンツ量が不足しており、AIで引用されにくい可能性があります",
    ].filter(Boolean);

    const suggestions = [
      "LLMs.txtを設置し、AI検索に対してコンテンツの公開範囲を明確にしましょう",
      "JSON-LD形式の構造化データを追加し、AIへ内容の意味を伝えましょう",
      "AI引用されやすくするため、コンテンツ量と専門性をさらに強化しましょう",
    ];

    return { positives, issues, suggestions };
  };

  /** --------------------------
   * サブミット処理
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
          <h2 className="text-xl font-bold text-gray-800">AI対策サイト診断</h2>
          <p className="text-sm text-gray-500">URLを入力するとAI対策スコアを自動算出します</p>

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
            AI対策診断を開始する
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">AI対策状況を分析中です...</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-6">

            {/* スコアカード */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-blue-500">
              <h3 className="text-xl font-bold mb-2">📊 AI対策スコア</h3>
              <p className="text-3xl font-black">{result.score} / 100</p>
              <p className="text-gray-600">
                {result.score >= 90 ? "非常に優秀です（AI検索への最適化が進んでいます）" :
                 result.score >= 75 ? "良好です（さらに強化する余地があります）" :
                 result.score >= 60 ? "改善の余地があります" :
                 "AI検索への対応が急務です"}
              </p>
            </div>

            {/*できている点*/}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-green-500">
              <h3 className="text-lg font-bold mb-2">🟩 AI対策としてできている点</h3>
              <ul className="list-disc ml-6 space-y-1 text-gray-800">
                {generateSummary(result).positives.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {/*課題*/}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-red-500">
              <h3 className="text-lg font-bold mb-2">🟥 AI対策としての課題</h3>
              <ul className="list-disc ml-6 space-y-1 text-gray-800">
                {generateSummary(result).issues.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {/*改善*/}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-yellow-500">
              <h3 className="text-lg font-bold mb-2">💡 AI時代の改善提案</h3>
              <ul className="list-disc ml-6 space-y-1 text-gray-800">
                {generateSummary(result).suggestions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>

              {/* CTAボタン */}
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold mt-6"
                onClick={() => alert("お問い合わせフォームURLは準備中です。設定後に遷移します。")}
              >
                AI対策の具体的な改善案について相談する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
