// src/App.tsx
import { useState } from "react";
// アイコンを追加でインポート
import { 
  Loader2, 
  Crown, 
  Check, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";
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
              label={matches[index]} // マッチしたテキストをそのまま使う
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
  improve: any[]; // improveがオブジェクト配列の場合に対応
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ========================================== */}
        {/* メイン入力エリア（デザインそのまま・構成強化）  */}
        {/* ========================================== */}
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-md relative overflow-hidden">
          
          {/* 追加要素：実績バッジ（左上） */}
          <div className="absolute top-0 left-0 bg-yellow-500 text-white text-xs md:text-sm font-bold px-4 py-1 rounded-br-lg shadow-sm flex items-center gap-1 z-10">
            <Crown className="w-4 h-4" />
            累計10万サイト突破！
          </div>

          <div className="space-y-6 pt-4">
            
            {/* タイトルセクション */}
            <div className="text-center md:text-left">
              <h2 className="text-[1.85rem] font-bold tracking-wide text-slate-900 leading-snug">
                AI時代のWEB対策(AIO)できていますか？
                <br />
                <span className="text-indigo-700 font-semibold tracking-wide bg-indigo-50 px-1 rounded">
                  あなたのサイトを10秒で診断。
                </span>
              </h2>
            </div>

            {/* 2カラムレイアウト（PC時）：左にフォームとメリット、右にキャラ */}
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* 左カラム：メインコンテンツ */}
              <div className="flex-1 space-y-6">
                
                {/* メリットリスト（安心感の追加） */}
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-600 text-sm md:text-base leading-relaxed">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>
                      URLを入力するだけで、<b className="text-slate-800">LLMs.txt</b>・<b className="text-slate-800">構造化データ</b>などの重要ポイントを自動チェック。
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600 text-sm md:text-base leading-relaxed">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>
                      <span className="text-red-500 font-bold">改善すべき課題</span>とリスクがすぐに分かります。
                    </span>
                  </li>
                </ul>

                {/* フォームエリア */}
                <div className="space-y-4 pt-2 relative">
                  
                  {/* 吹き出し（マイクロコピー） */}
                  <div className="absolute -top-3 right-0 md:right-auto md:left-1/2 bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200 transform md:-translate-x-1/2">
                    \ 面倒な登録は一切不要！ /
                  </div>

                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-shadow"
                  />

                  <button
                    onClick={handleSubmit}
                    className="group w-full bg-indigo-700 hover:bg-indigo-800 text-white py-4 rounded-lg font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:translate-y-0.5"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                    )}
                    <span className="text-lg">AI対策の簡易診断を行う</span>
                  </button>

                  {/* 安心感の補足 */}
                  <div className="flex justify-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> 無料
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> 即時解析
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> 安全な通信
                    </span>
                  </div>
                </div>

              </div>

              {/* 右カラム：キャラクター（PCのみ表示） */}
              <div className="hidden md:flex md:w-1/3 items-center justify-center">
                 {/* ここにキャラクター画像を配置してください。
                    画像がない場合はこのプレースホルダーが表示されます。
                 */}
                 <div className="w-full h-full min-h-[200px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-4xl mb-2">👩‍💻</span>
                    <span className="text-xs font-bold">ナビゲーター画像</span>
                 </div>
              </div>
            </div>

            {/* フッターテキスト */}
            <p className="text-xs text-slate-500 leading-loose tracking-wide border-t border-slate-100 pt-4 mt-4">
              本診断では、AI対策における基本的なチェック項目を分かりやすく確認できます。
              より詳しい改善優先度・具体的施策まで知りたい方は、詳細診断をご案内できます。
            </p>
          </div>
        </div>


        {/* ========================================== */}
        {/* 以下、診断結果エリア（ロジックは既存のまま）  */}
        {/* ========================================== */}

        {/* エラー */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ローディング */}
        {isLoading && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">
              AI対策状況を分析中です...
            </p>
          </div>
        )}

        {/* 結果表示 */}
        {result && !isLoading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* スコア */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-indigo-500">
              <h3 className="text-xl font-bold mb-2 text-slate-800">📊 AI対策スコア</h3>
              <p className="text-4xl font-black text-indigo-700">{result.score} / 100</p>
              <p className="text-slate-600 mt-2 font-bold">{renderScoreComment(result.score)}</p>
            </div>

            {/* できている点 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-green-500">
              <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 p-1 rounded">✔</span> 
                AI対策としてできている点
              </h3>
              <ul className="list-none space-y-3 text-slate-700">
                {result.done.map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{renderWithTooltips(text)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 課題 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-red-500">
              <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                 <span className="bg-red-100 text-red-700 p-1 rounded">!</span>
                 AI対策としての課題
              </h3>

              {result.issues.map((issue, i) => (
                <div key={i} className="mb-8 last:mb-0 p-4 bg-red-50 rounded-lg border border-red-100">

                  <p className="font-bold text-red-800 text-lg mb-2">
                    ✕ {renderWithTooltips(issue.title)}
                  </p>
                  <p className="text-slate-800 mb-3">{renderWithTooltips(issue.summary)}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="text-xs font-bold text-red-500 mb-1">▼ なぜ問題？</p>
                      <ul className="list-disc ml-4 text-sm text-slate-600">
                        {issue.why.map((w, j) => (
                          <li key={j}>{renderWithTooltips(w)}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="text-xs font-bold text-red-500 mb-1">▼ 放置すると？</p>
                      <ul className="list-disc ml-4 text-sm text-slate-600">
                        {issue.risks.map((r, j) => (
                          <li key={j}>{renderWithTooltips(r)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 改善提案 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-yellow-500">
              <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-yellow-100 text-yellow-700 p-1 rounded">💡</span>
                改善提案
              </h3>

              {result.improve.map((item: any, i) => (
                <div key={i} className="mb-4 last:mb-0 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <p className="font-bold text-slate-800 text-lg">
                    ◎ {item.title || item}
                  </p>
                  {item.summary && (
                    <p className="text-slate-600 leading-relaxed mt-1">
                      {item.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* お問い合わせカード */}
            <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                詳しい診断をご希望の方へ
              </h3>    
              <p className="text-sm text-slate-300 leading-relaxed">
                本診断では把握しきれない改善優先度や具体的な施策について、専門スタッフが個別にご案内します。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://www.rip-ple.com/%E3%81%8A%E5%95%8F%E5%90%88%E3%81%9B/"
                  className="flex-1 bg-white text-indigo-900 hover:bg-indigo-50 py-3 rounded-lg font-bold text-center transition-colors"
                >
                  お問い合わせする
                </a>
                <a
                  href="https://timerex.net/s/cev29130/87e0c2af/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-white text-white hover:bg-white/10 py-3 rounded-lg font-bold text-center transition-colors"
                >
                  無料オンライン面談を予約
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
