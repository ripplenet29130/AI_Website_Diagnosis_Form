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
            <Tooltip key={`${key}-${i}-${index}`} label={key} description={description} />
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
  // 診断送信
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

  // ----------------------
  // スコアのコメント
  // ----------------------
  
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
          <h2 className="text-[1.9rem] font-semibold tracking-tight text-gray-900 leading-snug">
          AI時代のWEB対策(AIO)できていますか？
          <br />
          <span className="text-indigo-600 font-medium tracking-tight">
            あなたのサイトを10秒で診断。
          </span>
        </h2>
      
        <p className="text-sm text-gray-500 leading-relaxed tracking-wide">
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

          <p className="text-xs text-gray-400 leading-relaxed">
          ※本診断は AI対策の基本項目をチェックする簡易診断です。
          より詳しい改善優先度・具体的施策まで知りたい方は、別途、詳細診断をご案内できます。
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

            {/* スコア */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-blue-500">
              <h3 className="text-xl font-bold mb-2">📊 AI対策スコア</h3>
              <p className="text-3xl font-black">{result.score} / 100</p>
              <p className="text-gray-600">{renderScoreComment(result.score)}</p>
            </div>

            {/* -------------------- */}
            {/* できている点 */}
            {/* -------------------- */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-green-500">
              <h3 className="text-lg font-bold mb-2">🟩 AI対策としてできている点</h3>
              <ul className="list-disc ml-6 space-y-1 text-gray-800">
                {result.done.map((text, i) => (
                  <li key={i}>{renderWithTooltips(text)}</li>
                ))}
              </ul>
            </div>

            {/* -------------------- */}
            {/* 課題（構造化データ） */}
            {/* -------------------- */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-red-500">
              <h3 className="text-lg font-bold mb-2">🟥 AI対策としての課題</h3>

              {result.issues.map((issue, i) => (
                <div key={i} className="mb-6 space-y-2">

                  {/* タイトル */}
                  <p className="font-bold text-gray-900">
                    <span className="text-red-600">✕</span>{" "}
                    {renderWithTooltips(issue.title)}
                  </p>


                  {/* サマリー */}
                  <p>{renderWithTooltips(issue.summary)}</p>

                  {/* なぜ問題？ */}
                  <p className="mt-2 font-semibold">▼ なぜ問題？</p>
                  <ul className="list-disc ml-6">
                    {issue.why.map((w, j) => (
                      <li key={j}>{renderWithTooltips(w)}</li>
                    ))}
                  </ul>

                  {/* 放置すると？ */}
                  <p className="mt-2 font-semibold">▼ 放置すると？</p>
                  <ul className="list-disc ml-6">
                    {issue.risks.map((r, j) => (
                      <li key={j}>{renderWithTooltips(r)}</li>
                    ))}
                  </ul>

                </div>
              ))}
            </div>

            {/* ========================= */}
            {/* 改善提案（improve） */}
            {/* ========================= */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-yellow-500">
              <h3 className="text-lg font-bold mb-2">💡 改善提案</h3>

              {result.improve.map((item, i) => (
                <div key={i} className="mb-6">
                <p className="font-bold text-gray-900">◎ {item.title}</p>
                <p className="text-gray-800 leading-relaxed mt-1">
                  {item.summary}
                </p>
                </div>
              ))}
          
          </div>

          {/* お問い合わせカード */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            💡 詳しい診断をご希望の方へ
            </h3>    
                <p className="text-sm text-gray-500 leading-relaxed">
                  本診断では把握しきれない改善優先度や具体的な施策について、
                  専門スタッフが個別にご案内します。
                </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.rip-ple.com/%E3%81%8A%E5%95%8F%E5%90%88%E3%81%9B/"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-center"
              >
                お問い合わせする
              </a>
            
              <a
                href="https://timerex.net/s/cev29130/87e0c2af/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-semibold text-center"
              >
                担当者と話す（オンライン面談を予約）
              </a>
            </div>


          </div>

            
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
