// src/App.tsx
import { useState } from "react";
import { Loader2, Check, Crown, Sparkles, ChevronRight } from "lucide-react";
import Tooltip from "./components/Tooltip";

// （省略：tooltipDictionary, renderWithTooltips, 型定義などのロジック部分は変更なし）
// ...（前回のコードのロジック部分をそのまま使ってください）...
// ここでは省略して表示に必要な部分とAppコンポーネントのみ書きます

// ----------------------
// Tooltip変換関数（中身は前回のまま）
// ----------------------
// ...

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // 型定義は省略
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState("");

  const handleSubmit = async () => {
    // （前回の処理そのまま）
    if(!inputUrl) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setResult({score: 85, done:[], issues:[], improve:[]}) }, 2000); // テスト用ダミー
  };

  return (
    // 全体のフォントを日本のサイトらしく設定
    <div className="min-h-screen bg-[#FFFcf5] py-12 px-4 font-['Noto_Sans_JP',_sans-serif] text-[#333]">
      
      {/* 背景の幾何学模様（CSSで再現するか、薄い画像を敷く） */}
      <div className="max-w-5xl mx-auto">
        
        {/* ========================================== */}
        {/* メインカード（白い部分）                     */}
        {/* ========================================== */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 relative overflow-visible p-6 md:p-10">
          
          {/* 左上の王冠バッジ（CSSで再現） */}
          <div className="absolute -top-3 left-4 md:-top-4 md:left-10 bg-gradient-to-b from-[#eebf5e] to-[#d49e30] text-white font-bold px-4 py-2 rounded shadow-md border-b-2 border-[#b07e1a] z-10 flex items-center gap-2">
            <Crown className="w-5 h-5 fill-white" />
            <span className="drop-shadow-sm text-sm md:text-base">累計10万サイト突破！</span>
          </div>

          <div className="mt-8 md:mt-6">
            
            {/* 1. 見出しエリア */}
            <h2 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight text-[#5a2a2a] mb-6">
              AI時代のWEB対策(AIO)できていますか？
              <br />
              あなたのサイトを
              <span className="relative inline-block mx-2">
                <span className="relative z-10 text-[#c72626]">10秒</span>
                {/* 黄色いマーカー線 */}
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#fff04d] -z-0 transform -rotate-1"></span>
              </span>
              で診断
            </h2>

            {/* 2. メリット（チェックリスト） */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-[#cba876] text-white rounded-full p-0.5 mt-1 shrink-0">
                   <Check className="w-4 h-4" />
                </div>
                <p className="text-[#5a4a4a] font-medium leading-relaxed">
                  URLを入力するだけで、LLMs.txt・構造化データ・robots.txtなど
                  <strong className="text-[#c72626]">AI対策の重要な技術ポイント</strong>を
                  <br className="hidden md:block"/>
                  <strong className="text-[#c72626]">重要な施策点</strong>を自動チェックします。
                </p>
              </div>
            </div>

            {/* 3. アクションエリア（破線枠＋キャラ） */}
            <div className="flex flex-col md:flex-row gap-8 items-end">
              
              {/* 左側：入力フォーム（破線枠の中） */}
              <div className="flex-1 w-full relative border-2 border-dashed border-[#8b7968] rounded-2xl p-6 bg-[#fdfdfd]">
                
                {/* 吹き出し */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white border border-[#5a4a4a] text-[#333] px-6 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap z-10">
                  \ たった<span className="text-[#c72626]">10秒</span>！URLを入れるだけ /
                  {/* 吹き出しのしっぽ */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-[#5a4a4a] rotate-45"></div>
                </div>

                <div className="mt-2 space-y-4">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 text-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />

                  {/* ★ここがポイント：画像みたいなボタンをCSSで作る */}
                  <button
                    onClick={handleSubmit}
                    className="w-full relative group overflow-hidden rounded-lg shadow-lg transform transition-all active:translate-y-1"
                  >
                    {/* ボタン本体：オレンジのグラデーションと立体的な影 */}
                    <div className="bg-gradient-to-b from-[#ff9a3d] to-[#e85a0c] text-white text-xl md:text-2xl font-bold py-4 px-6 border border-[#ffb06e] border-b-[#c24200] border-b-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] flex items-center justify-center gap-2">
                       {isLoading ? <Loader2 className="animate-spin" /> : <ChevronRight className="fill-white" />}
                       <span className="drop-shadow-md">今すぐ無料で診断する</span>
                    </div>
                    {/* キラッと光る演出（オプション） */}
                    <div className="absolute top-0 -left-full w-1/2 h-full bg-white/20 skew-x-[-20deg] group-hover:animate-[shimmer_1s_infinite]"></div>
                  </button>
                  
                  <p className="text-center text-xs text-white font-bold drop-shadow-md -mt-10 pointer-events-none relative z-10">
                     {/* ボタン内下部の文字を入れるならここ */}
                     <span className="opacity-90">会員登録不要・安心のSSL通信</span>
                  </p>
                </div>
              </div>

              {/* 右側：キャラクター画像（これだけは画像を使う！） */}
              <div className="w-32 md:w-48 shrink-0 mx-auto md:mx-0">
                 {/* ★ここにキャラクター画像を入れてください 
                    画像は「背景が透明なPNG」を使うと綺麗になじみます
                 */}
                 <img 
                   src="https://placehold.co/200x250/transparent/png?text=Navi" 
                   alt="案内キャラクター" 
                   className="w-full h-auto object-contain drop-shadow-xl"
                 />
              </div>
            </div>

            {/* フッター注釈 */}
            <div className="mt-6 text-xs md:text-sm text-gray-500 space-y-1">
              <p>本診断では、AI対策における基本的なチェック項目を分かりやすく確認できます。</p>
              <p className="flex items-center gap-1">
                <span className="text-[#7CB342]">🔰</span>
                より詳しい改善優先度・具体的施策まで知りたい方は、詳細診断をご案内できます。
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
