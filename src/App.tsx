// src/App.tsx
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Tooltip from "./components/Tooltip";

// ----------------------
// Tooltip 対象キーワード辞書
// ----------------------
const tooltipDictionary: Record<string, string> = {
  "robots.txt":
    "検索エンジンにクロールしてよいページを伝える設定ファイルです。AIクローラにも重要です。",
  "sitemap.xml":
    "サイト内のページ一覧を検索エンジンに伝えるための XML ファイルです。AIにも理解されやすくなります。",
  HTTPS:
    "通信が暗号化されている安全なサイトとして、検索エンジンに評価されやすくなります。",
  "JSON-LD":
    "構造化データ形式です。AIにページ内容を正確に伝えるために重要です。",
  favicon:
    "サイトのアイコンです。ブランド認識や検索結果での視認性に影響します。",
  "LLMs.txt":
    "AIクローラに“どのページをAI学習に使ってよいか”を指示するためのファイルです。",
};

// ----------------------
// 柔軟にマッチする正規表現
// robots.txt / robots. txt / robots．txt に対応
// ----------------------
const tooltipPatterns: Record<string, RegExp> = {
  "robots.txt": /robots[．.] ?txt/gi,
  "sitemap.xml": /sitemap[．.] ?xml/gi,
  HTTPS: /HTTPS/gi,
  "JSON-LD": /JSON-?LD/gi,
  favicon: /favicon/gi,
  "LLMs.txt": /LLMs[．.] ?txt/gi,
};

// ----------------------
// Tooltip 変換関数
// ----------------------
function renderWithTooltips(text: string) {
  let tokens: (string | JSX.Element)[] = [text];

  Object.entries(tooltipPatterns).forEach(([key, regex]) => {
    const description = tooltipDictionary[key];

    tokens = tokens.flatMap((chunk, idx) => {
      if (typeof chunk !== "string") return [chunk];

      const parts = chunk.split(regex);
      const matches = chunk.match(regex);

      if (!matches) return [chunk];

      const next: (string | JSX.Element)[] = [];

      parts.forEach((part, i) => {
        if (part) next.push(part);

        if (i < matches.length) {
          next.push(
            <Tooltip
              key={`${key}-${idx}-${i}`}
              label={key}
              description={description}
            />
          );
        }
      });

      return next;
    });
  });

  return <>{tokens}</>;
}

// ----------------------
// API 型
// ----------------------
interface AnalyzeResult {
  success: boolean;
  score: number;
  done: string[];
  issues: string[];
  improve: string[];
  error?: string;
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState("");

  const NETLIFY_API =
    "https://ai-website-diagnosis-form.netlify.app/.netlify/functions";

  // ----------------------
  // Submit 処理
  // ----------------------
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

      const json: AnalyzeResult = await res.json();

      console.log("AI RAW RESULT:", json);

      if (!res.ok || json.success === false) {
        throw new Error(json.error || "診断に失敗しました");
      }

      setResult(json);
    } catch (err: any) {
      setError(err.message || "通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const renderScoreComment = (score: number) => {
    if (score >= 90) return "非常に優秀です（AI検索への最適化が進んでいます）";
    if (score >= 75) return "良好です（さらに強化する余地があります）";
    if (score >= 60) return "改善の余地があります";
    return "AI検索への対応が急務です";
  };

  // ------------------------------------------------------
  // JSX：UI
  // ------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 入力フォーム */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            AI時代のWEB対策できていますか？
            <br />
            <span className="text-blue-600">あなたのサイトを10秒で診断します。</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            URLを入力するだけで、LLMs.txt・構造化データ・robots.txt などAI対策の重要ポイントを自動チェックします。
          </p>


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
                <p className="text-gray-600 font-medium">
                  AI対策状況を分析中です...
                </p>
              </div>
        )}

        {/* 結果表示 */}
        {result && !isLoading && (
          <div className="space-y-6">
            {/* スコア */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-blue-500">
              <h3 className="text-xl font-bold mb-2">📊 AI対策スコア</h3>
              <p className="text-3xl font-black">{result.score} / 100</p>
              <p className="text-gray-600">
                {renderScoreComment(result.score)}
              </p>
            </div>

            {/* できている点（Tooltip 付き） */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-green-500">
              <h3 className="text-lg font-bold mb-2">
                🟩 AI対策としてできている点
              </h3>

              <ul className="list-disc ml-6 space-y-1 text-gray-800">
                {result.done.map((text, i) => (
                  <li key={i}>{renderWithTooltips(text)}</li>
                ))}
              </ul>
            </div>

            {/* 課題（Tooltip 付き） */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-red-500">
              <h3 className="text-lg font-bold mb-2">
                🟥 AI対策としての課題
              </h3>

              <ul className="list-disc ml-6 space-y-1 text-gray-800">
                {result.issues.map((text, i) => (
                  <li key={i}>{renderWithTooltips(text)}</li>
                ))}
              </ul>
            </div>

          {/* 改善提案（Tooltip 付き） */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-yellow-500">
            <h3 className="text-lg font-bold mb-2">💡 AI時代の改善提案</h3>
          
            <ul className="list-disc ml-6 space-y-1 text-gray-800">
              {result.improve.map((text, i) => (
                <li key={i}>{renderWithTooltips(text)}</li>
              ))}
            </ul>
          
            {/* 🔵 復活させた CTA ボタン */}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold mt-6"
              onClick={() =>
                alert(
                  "お問い合わせフォームURLは準備中です。設定後にこちらから遷移するように変更できます。"
                )
              }
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
