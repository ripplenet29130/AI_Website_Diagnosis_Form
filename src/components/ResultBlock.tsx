import { LucideIcon } from "lucide-react";
import Tooltip from "./Tooltip";

interface ResultBlockProps {
  title: string;
  icon: LucideIcon;
  content: string | string[];
  color: string;
}

export default function ResultBlock({
  title,
  icon: Icon,
  content,
  color,
}: ResultBlockProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    red: "bg-red-50 border-red-200 text-red-700",
    teal: "bg-teal-50 border-teal-200 text-teal-700",
  };

  const colorClass =
    colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  // 🔍 専門用語 → 説明の辞書（ここを追加）
  const glossary: Record<string, string> = {
    "LLMs.txt":
      "AIに対して『サイト内のどこを学習・参照してよいか』を明示するための新しい設定ファイルです。",
    "robots.txt":
      "AI・検索エンジンに『どのページをクロールしてよいか』を伝えるファイルです。",
    "sitemap.xml":
      "サイトの全URLを検索エンジンへ知らせるリストで、AIにも有効です。",
    HTTPS:
      "通信内容を暗号化し、AIや検索エンジンの評価にも影響します。",
    "JSON-LD":
      "AIが内容を正しく理解しやすくするための構造化データです。",
    favicon:
      "ブラウザのタブに表示される小さなアイコンで、ブランド認識に役立ちます。",
    コンテンツ量:
      "ページに十分な文章があると、AIが正しく理解しやすく評価が上がります。",
  };

  // 🔍 テキスト内のキーワードを Tooltip 付き要素に変換する
  const renderWithTooltip = (text: string) => {
    let replaced = text;

    Object.keys(glossary).forEach((keyword) => {
      if (text.includes(keyword)) {
        replaced = replaced.replace(
          keyword,
          `<span class="tooltip-key" data-key="${keyword}">${keyword}</span>`
        );
      }
    });

    return replaced;
  };

  return (
    <div className={`${colorClass} border rounded-lg p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {Array.isArray(content) ? (
        <ul className="space-y-2">
          {content.map((item, index) => (
            <li
              key={index}
              className="text-base leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderWithTooltip(item),
              }}
            />
          ))}
        </ul>
      ) : (
        <p
          className="text-base leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: renderWithTooltip(content),
          }}
        />
      )}

      {/* Tooltip をまとめて表示する部分 */}
      <Tooltip />
    </div>
  );
}
