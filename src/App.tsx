import { useState } from "react";
import InputForm from "./components/InputForm";
import { Loader2 } from "lucide-react";

/* ========== 型 ========= */
interface DiagnosisResult {
  llms: string;
  score: string;
  issues: string[];
  suggestions: string[];
}

/* APIエンドポイント */
const NETLIFY_API = "/.netlify/functions/check-llms";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ========== 診断処理（LLMs判定） ========== */
  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(NETLIFY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("診断APIとの通信に失敗しました");

      const json = await res.json();
      setResult(json);

    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================================================================
    🚧 コメントアウトで保持：後で追加する機能
  ======================================================================== */

  // ---------------------- AI分析機能（後日復帰） ----------------------
  /*
  const analyzeWithAI = async (url: string) => {
    const res = await fetch("/.netlify/functions/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return await res.json();
  };
  */

  // ---------------------- DB保存機能（後日復帰） ----------------------
  /*
  const saveToDatabase = async (request_id: string, url: string, result: any) => {
    await fetch("https://rip-ple.com/api/save-result.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id, target_url: url, result }),
    });
  };
  */

  // ---------------------- PDF生成（後日復帰） ----------------------
  /*
  const downloadPDF = async (originalResult: any) => {
    const response = await fetch("/.netlify/functions/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: originalResult }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website_report.pdf";
    a.click();
  };
  */
  /* ======================================================================== */

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
            <p className="text-gray-600 font-medium">分析中です、少々お待ちください...</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="bg-white shadow-md rounded-xl p-8 space-y-6">

            <h2 className="text-xl font-bold">📊 AI対策診断結果</h2>
            <p className="text-lg font-medium">現状スコア：{result.score}</p>

            <div>
              <p className="font-semibold text-gray-800 mb-2">主な課題：</p>
              <ul className="list-decimal pl-5 space-y-1">
                {result.issues.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-2">改善提案（即実行可能）：</p>
              <ul className="list-disc pl-5 space-y-1">
                {result.suggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
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
