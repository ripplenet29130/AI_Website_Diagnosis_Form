import { useState } from 'react';
import {
  Search,
  Eye,
  TrendingUp,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Loader2,
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
  const [error, setError] = useState<string | null>(null);

  const convertToList = (text: string): string[] => {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => (line.startsWith('・') ? line : `・${line}`));
  };

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data: AnalysisResult = await response.json();

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
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
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
        )}
      </div>
    </div>
  );
}

export default App;
