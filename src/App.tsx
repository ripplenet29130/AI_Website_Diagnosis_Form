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
// Tooltip変換関数
// ----------------------
function renderWithTooltips(text: string) {
  let content: (string | JSX.Element)[] = [text];

  Object.keys(tooltipDictionary).forEach((key) => {
    const regex = new RegExp(key.replace(".", "\\."), "gi");
    const description = tooltipDictionary[key];

    content = content.flatMap((chunk, i) => {
      if (typeof chunk !== "string") return chunk;

      const parts = chunk.split(regex);
      const matches = chunk.match(regex);

      if (!matches) return chunk;

      const newParts: (string | JSX.Element)[] = [];

      parts.forEach((part, index) => {
        if (part) newParts.push(part);
        if (index < matches.length) {
          newParts.push(
            <Tooltip
              key={`${key}-${i}-${index}`}
              label={key}
              description={description}
            />
          );
        }
      });

      return newParts;
    });
  });

  return <>{content}</>;
}

// ----------------------
// APIレスポンス型
// ----------------------
interface IssueItem {
  title: string;
  summary: string;
  why: string[];
  risks: string[];
}

interface AnalyzeResult {
  success: boolean;
  score: number;
  done: string[];
  issues: IssueItem[];
  improve: any[];
  error?: string;
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState("");

  const NETLIFY_API =
    "https://ai-website-diagnosis-form.netlify.app/.netlify/functions";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* 入力フォーム */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">

          {/* 見出し（← ここが一番変わる） */}
          <h2 className="
            font-heading
            text-[1.9rem]
            font-bold
            tracking-wide
            leading-snug
            text-slate-900
          ">
            AI時代のWEB対策(AIO)できていますか？
            <br />
            <span className="font-heading text-indigo-700 font-semibold">
              あなたのサイトを10秒で診断。
            </span>
          </h2>

          <p className="text-base text-slate-600 leading-loose">
            URLを入力するだけで、LLMs.txt・構造化データ・robots.txt など
            AI対策の重要な技術ポイントを自動チェックします。
          </p>

          <input
            type="text"
            placeholder="https://example.com"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-3 text-base"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-lg font-semibold tracking-wide flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            AI対策の簡易診断を行う
          </button>

          <p className="text-xs text-slate-500 leading-loose">
            本診断では、AI対策における基本的なチェック項目を分かりやすく確認できます。
            より詳しい改善優先度・具体的施策まで知りたい方は、詳細診断をご案内できます。
          </p>
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

            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-blue-500">
              <h3 className="font-heading text-xl font-bold mb-2">
                📊 AI対策スコア
              </h3>
              <p className="text-3xl font-black">{result.score} / 100</p>
              <p className="text-gray-600">
                {renderScoreComment(result.score)}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;
