// src/App.tsx
import { useState } from "react";
// 必要なアイコンをすべてインポート
import { 
  Loader2, 
  // Crown, // 削除
  Check, 
  ShieldCheck, 
  ChevronRight,
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
              label={matches[index]}
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
    // 全体のフォント・背景設定
    <div className="min-h-screen bg-[#FFFcf5] py-12 px-4 font-['Noto_Sans_JP',_sans-serif] text-[#333]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ========================================== */}
        {/* 1. メイン診断フォームエリア（リッチデザイン）      */}
        {/* ========================================== */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 relative overflow-visible p-6 md:p-10">
          
          {/* バッジ削除済み */}

          <div className="mt-2 md:mt-4 text-center">
            
            {/* 見出しエリア：font-serif を追加して明朝体に */}
            <h2 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight text-[#5a2a2a] mb-8 font-serif">
              AI時代のWEB対策(AIO)できていますか？
              <br />
              あなたのサイトを
              <span className="relative inline-block mx-2">
                <span className="relative z-10 text-[#c72626]">10秒</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#fff04d] -z-0 transform -rotate-1"></span>
              </span>
              で診断
            </h2>

            {/* メリット（チェックリスト） */}
            {/* 中央揃えで見やすいように max-w を設定して mx-auto で配置 */}
            <div className="space-y-4 mb-10 max-w-2xl mx-auto text-left">
              
              {/* 1行目 */}
              <div className="flex items-start gap-3">
                <div className="bg-[#cba876] text-white rounded-full p-0.5 mt-1 shrink-0">
                   <Check className="w-4 h-4" />
                </div>
                <p className="text-[#5a4a4a] font-medium leading-relaxed">
                  URLを入力するだけで、LLMs.txt・構造化データ・robots.txtなど<strong className="text-[#c72626]">AI対策の重要な技術ポイント</strong>を自動チェック。
                </p>
              </div>

              {/* 2行目 */}
              <div className="flex items-start gap-3">
                <div className="bg-[#cba876] text-white rounded-full p-0.5 mt-1 shrink-0">
                   <Check className="w-4 h-4" />
                </div>
                <p className="text-[#5a4a4a] font-medium leading-relaxed">
                  <strong className="text-[#c72626]">改善すべき課題</strong>とリスクがすぐに分かります。
                </p>
              </div>

            </div>

            {/* アクションエリア（フォームのみ・中央配置） */}
            <div className="w-full max-w-2xl mx-auto relative border-2 border-dashed border-[#8b7968] rounded-2xl p-6 md:p-8 bg-[#fdfdfd]">
              
              {/* 吹き出し */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white border border-[#5a4a4a] text-[#333] px-6 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap z-10">
                \ たった<span className="text-[#c72626]">10秒</span>！URLを入れるだけ /
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-[#5a4a4a] rotate-45"></div>
              </div>

              <div className="mt-4 space-y-5">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-4 text-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />

                {/* リッチなボタン */}
                <button
                  onClick={handleSubmit}
                  className="w-full relative group overflow-hidden rounded-lg shadow-lg transform transition-all active:translate-y-1"
                >
                  <div className="bg-gradient-to-b from-[#ff9a3d] to-[#e85a0c] text-white text-xl md:text-2xl font-bold py-4 px-6 border border-[#ffb06e] border-b-[#c24200] border-b-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] flex items-center justify-center gap-2">
                      {isLoading ? <Loader2 className="animate-spin" /> : <ChevronRight className="fill-white" />}
                      <span className="drop-shadow-md">今すぐ無料で診断する</span>
                  </div>
                  {/* キラッと光る演出 */}
                  <div className="absolute top-0 -left-full w-1/2 h-full bg-white/20 skew-x-[-20deg] group-hover:animate-[shimmer_1s_infinite]"></div>
                </button>
                
                {/* 安心感の補足 */}
                <div className="flex justify-center gap-4 text-xs text-[#8b7968]">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 無料</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 即時解析</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 安全な通信</span>
                </div>
              </div>
            </div>

            {/* フッターテキスト */}
            <div className="mt-8 text-xs md:text-sm text-gray-500 space-y-1">
              <p>本診断では、AI対策における基本的なチェック項目を分かりやすく確認できます。</p>
              <p className="flex items-center justify-center gap-1">
                <span className="text-[#7CB342]">🔰</span>
                より詳しい改善優先度・具体的施策まで知りたい方は、詳細診断をご案内できます。
              </p>
            </div>
          </div>
        </div>


        {/* ========================================== */}
        {/* 2. 診断結果エリア（デザインを暖色系に調整）      */}
        {/* ========================================== */}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ローディング */}
        {isLoading && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-12 h-12 text-[#e85a0c] animate-spin mb-4" />
            <p className="text-[#5a4a4a] font-medium">
              AI対策状況を分析中です...
            </p>
          </div>
        )}

        {/* 結果表示 */}
        {result && !isLoading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* スコアカード：オレンジ/茶色テーマに変更 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-[#e85a0c]">
              <h3 className="text-xl font-bold mb-2 text-[#5a2a2a]">📊 AI対策スコア</h3>
              <p className="text-4xl font-black text-[#e85a0c]">{result.score} / 100</p>
              <p className="text-[#5a4a4a] mt-2 font-bold">{renderScoreComment(result.score)}</p>
            </div>

            {/* できている点 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-[#7CB342]">
              <h3 className="text-lg font-bold mb-4 text-[#5a2a2a] flex items-center gap-2">
                <span className="bg-[#f1f8e9] text-[#7CB342] p-1 rounded">✔</span> 
                AI対策としてできている点
              </h3>
              <ul className="list-none space-y-3 text-[#5a4a4a]">
                {result.done.map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#7CB342] shrink-0 mt-0.5" />
                    <span>{renderWithTooltips(text)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 課題 */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-[#c72626]">
              <h3 className="text-lg font-bold mb-4 text-[#5a2a2a] flex items-center gap-2">
                 <span className="bg-[#ffebee] text-[#c72626] p-1 rounded">!</span>
                 AI対策としての課題
              </h3>

              {result.issues.map((issue, i) => (
                <div key={i} className="mb-8 last:mb-0 p-4 bg-[#fff5f5] rounded-lg border border-[#ffcdd2]">
                  <p className="font-bold text-[#b71c1c] text-lg mb-2">
                    ✕ {renderWithTooltips(issue.title)}
                  </p>
                  <p className="text-[#5a4a4a] mb-3">{renderWithTooltips(issue.summary)}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-[#ffcdd2]">
                      <p className="text-xs font-bold text-[#c72626] mb-1">▼ なぜ問題？</p>
                      <ul className="list-disc ml-4 text-sm text-[#5a4a4a]">
                        {issue.why.map((w, j) => (
                          <li key={j}>{renderWithTooltips(w)}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-[#ffcdd2]">
                      <p className="text-xs font-bold text-[#c72626] mb-1">▼ 放置すると？</p>
                      <ul className="list-disc ml-4 text-sm text-[#5a4a4a]">
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
            <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-[#fdd835]">
              <h3 className="text-lg font-bold mb-4 text-[#5a2a2a] flex items-center gap-2">
                <span className="bg-[#fffde7] text-[#fbc02d] p-1 rounded">💡</span>
                改善提案
              </h3>
              {result.improve.map((item: any, i) => (
                <div key={i} className="mb-4 last:mb-0 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <p className="font-bold text-[#5a2a2a] text-lg">
                    ◎ {item.title || item}
                  </p>
                  {item.summary && (
                    <p className="text-[#5a4a4a] leading-relaxed mt-1">
                      {item.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* お問い合わせカード：ダークブラウン系のアクセント */}
            <div className="bg-[#5a4a4a] text-white p-6 rounded-xl shadow-lg space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#fdd835]" />
                詳しい診断をご希望の方へ
              </h3>    
              <p className="text-sm text-gray-200 leading-relaxed">
                本診断では把握しきれない改善優先度や具体的な施策について、専門スタッフが個別にご案内します。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://www.rip-ple.com/%E3%81%8A%E5%95%8F%E5%90%88%E3%81%9B/"
                  className="flex-1 bg-white text-[#5a4a4a] hover:bg-gray-100 py-3 rounded-lg font-bold text-center transition-colors shadow-sm"
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
