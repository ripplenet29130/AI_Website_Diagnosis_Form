import { useState } from "react";
import { 
  Loader2, 
  Crown, 
  Check, 
  ChevronRight, 
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
    // 特殊文字のエスケープ
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
              label={matches[index]} // マッチした実際のテキストを使用（大文字小文字維持のため）
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
    // 背景：真っ白ではなく、温かみのあるオレンジベージュ系の背景色に
    <div className="min-h-screen bg-[#FFF9F5] py-12 px-4 font-sans text-slate-800">
      
      {/* メインコンテナ：紙のようなカードデザイン */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 relative">
        
        {/* 左上の「実績バッジ」 */}
        <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold px-6 py-2 rounded-br-2xl shadow-md z-10 flex items-center gap-2">
          <Crown className="w-5 h-5 fill-white" />
          累計10万サイト突破！
        </div>

        <div className="p-6 md:p-10 pt-16">
          
          {/* ヘッダーセクション */}
          <div className="text-center mb-8 space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">
              <span className="text-[#bf0000]">AI時代のWEB対策(AIO)</span>できていますか？
              <br className="hidden md:block" />
              <span className="inline-block mt-2">
                あなたのサイトを
                <span className="bg-gradient-to-t from-yellow-200 to-transparent bg-[length:100%_40%] bg-bottom px-1">
                  10秒で診断
                </span>
              </span>
            </h2>
          </div>

          {/* コンテンツエリア：左右分割（PC時） */}
          <div className="grid md:grid-cols-5 gap-8 items-end">
            
            {/* 左側：メリットリストとフォーム (3/5) */}
            <div className="md:col-span-3 space-y-6">
              
              {/* メリット箇条書き */}
              <ul className="space-y-3 bg-orange-50 p-4 rounded-xl border border-orange-100">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base font-medium">
                    URLを入力するだけで、
                    {renderWithTooltips("LLMs.txt")}・{renderWithTooltips("構造化データ")}・{renderWithTooltips("robots.txt")}など
                    <span className="text-red-600 font-bold mx-1">AI対策の重要な技術ポイント</span>
                    をチェック。
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base font-medium">
                    <span className="text-red-600 font-bold">重要な施策点</span>
                    を自動で洗い出し、改善案を提示します。
                  </p>
                </li>
              </ul>

              {/* 入力フォームエリア */}
              <div className="relative pt-6">
                {/* 吹き出し */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 bg-white border-2 border-orange-400 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm whitespace-nowrap animate-bounce-slow">
                  \ たった10秒！URLを入れるだけ /
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-orange-400 rotate-45"></div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-lg p-4 text-lg focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                  />

                  {/* 強化されたボタン */}
                  <button
                    onClick={handleSubmit}
                    className="group w-full bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white text-xl py-4 rounded-xl font-bold tracking-wide shadow-lg shadow-orange-200 border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    {/* キラッとするエフェクト（装飾） */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-yellow-200" />
                        <span>今すぐ無料で診断する</span>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  {/* マイクロコピー */}
                  <div className="flex justify-center items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      会員登録不要
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      安心のSSL通信
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側：キャラクターイラスト (2/5) */}
            <div className="hidden md:block md:col-span-2 relative">
               {/* ここにナビゲーターの画像を入れてください。
                 とりあえずプレースホルダーを表示しています。
               */}
               <div className="bg-gray-100 rounded-xl h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                  <div className="text-4xl mb-2">👩‍💼</div>
                  <span className="text-sm">ここに人物画像を配置</span>
                  <span className="text-xs text-slate-400 mt-1">（透過PNG推奨）</span>
               </div>
               
               {/* 画像がある場合の例: 
               <img 
                 src="/images/navi_woman.png" 
                 alt="診断ナビゲーター" 
                 className="w-full h-auto object-contain drop-shadow-xl"
               />
               */}
            </div>
          </div>

          {/* フッターテキスト */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-500 leading-relaxed">
            <p>
              <span className="text-yellow-500 mr-1">🔰</span>
              本診断では、AI対策における基本的なチェック項目を分かりやすく確認できます。
              より詳しい改善優先度・具体的施策まで知りたい方は、詳細診断をご案内できます。
            </p>
          </div>
        </div>

        {/* -------------------- */}
        {/* 以下、診断結果エリア */}
        {/* -------------------- */}
        
        {/* エラー表示 */}
        {error && (
          <div className="m-6 bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            {error}
          </div>
        )}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="p-10 flex flex-col items-center bg-white/90 absolute inset-0 z-50 justify-center">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-600 font-bold text-lg animate-pulse">
              AI対策状況を分析中です...
            </p>
            <p className="text-slate-400 text-sm mt-2">10秒ほどお待ちください</p>
          </div>
        )}

        {/* 結果表示（ここも少しリッチに） */}
        {result && !isLoading && (
          <div className="p-6 md:p-10 bg-slate-50 border-t-2 border-dashed border-slate-200">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                📊 あなたのサイトのAI対策スコア
              </h3>
              <div className="text-6xl font-black text-orange-600 my-4 tracking-tighter">
                {result.score}
                <span className="text-2xl text-slate-400 ml-2 font-medium">/ 100</span>
              </div>
              <p className="text-lg font-bold text-slate-800 bg-orange-100 inline-block px-6 py-2 rounded-full">
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
