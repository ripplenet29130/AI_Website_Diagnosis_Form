import { useState } from 'react';
import {
  Search,
  Eye,
  TrendingUp,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Loader2,
  Download,
} from 'lucide-react';

import InputForm from './components/InputForm';
import ResultBlock from './components/ResultBlock';

interface AnalysisResult {
  seo: string;
  ux: string;
  conversion: string;
  strengths: string;
  weaknesses: string;
  improvement: string;
}

interface DisplayResult {
  seo: string[];
  ux: string[];
  conversion: string[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DisplayResult | null>(null);
  const [originalResult, setOriginalResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertToList = (input: string | string[]): string[] => {
  // すでに配列なら → 各項目をトリムして返す
  if (Array.isArray(input)) {
    return input.map((item) =>
      item.replace(/^・+/g, "").trim()
    );
  }

  // 文字列なら split して整形
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^・+/g, "")); // ← AIの「・」を削除
};


const handleSubmit = async (url: string) => {
  setIsLoading(true);
  setResult(null);
  setOriginalResult(null);
  setError(null);

  try {
    // ① まず PHP に送って request_id を作る
    const reqRes = await fetch("https://rip-ple.com/api/create-request.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_url: url }),
    });

    const reqJson = await reqRes.json();
    if (!reqJson.success) {
      throw new Error("リクエスト登録に失敗しました: " + reqJson.error);
    }

    const request_id = reqJson.request_id;

    // ② 次に Netlify Functions を呼んで AI 診断を実行
    const aiRes = await fetch("/.netlify/functions/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!aiRes.ok) {
      const errJson = await aiRes.json();
      throw new Error(errJson.error || "分析に失敗しました");
    }

    const data: AnalysisResult = await aiRes.json();
    setOriginalResult(data);

    // ③ 診断結果を PHP に保存
    await fetch("https://rip-ple.com/api/save-result.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_id,
        target_url: url,
        result: JSON.stringify(data),
      }),
    });

    // ④ 画面用に整形
    const displayData: DisplayResult = {
      seo: convertToList(data.seo),
      ux: convertToList(data.ux),
      conversion: convertToList(data.conversion),
      strengths: convertToList(data.strengths),
      weaknesses: convertToList(data.weaknesses),
      improvements: convertToList(data.improvement),
    };

    setResult(displayData);
  } catch (err) {
    setError(err instanceof Error ? err.message : "エラーが発生しました");
  } finally {
    setIsLoading(false);
  }
};


  const downloadPDF = async () => {
    if (!originalResult) return;

    try {
      const response = await fetch('/.netlify/functions/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result: originalResult }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'website_report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('PDFのダウンロードに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8 result-text">
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">サイトを分析中です...</p>
          </div>
        )}

        {result && !isLoading && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <Download className="w-5 h-5" />
                PDFで保存する
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResultBlock
              title="SEO分析"
              icon={Search}
              content={result.seo}
              color="blue"
            />
            <ResultBlock
              title="UX/UI分析"
              icon={Eye}
              content={result.ux}
              color="purple"
            />
            <ResultBlock
              title="コンバージョン改善"
              icon={TrendingUp}
              content={result.conversion}
              color="teal"
            />
            <ResultBlock
              title="強み"
              icon={ThumbsUp}
              content={result.strengths}
              color="green"
            />
            <ResultBlock
              title="弱み"
              icon={AlertTriangle}
              content={result.weaknesses}
              color="orange"
            />

            <div className="md:col-span-2">
              <ResultBlock
                title="改善提案リスト"
                icon={Lightbulb}
                content={result.improvements}
                color="red"
              />
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
