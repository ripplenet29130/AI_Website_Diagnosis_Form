import { LucideIcon } from "lucide-react";
import Tooltip from "./Tooltip";

interface ResultBlockProps {
  title: string;
  icon: LucideIcon;
  content: string | string[];
  color: string;
}

// -------------------------
// 🔍 Tooltip 辞書（ここを編集すると一覧が更新される）
// -------------------------
const tooltipDictionary: Record<string, string> = {
  "robots.txt":
    "検索エンジンにクロールしてよいページを伝える設定ファイルです。AI クローラにも重要です。",
  "sitemap.xml":
    "サイト内のページ一覧を検索エンジンに伝えるための XML ファイルです。AI にも理解されやすくなります。",
  HTTPS:
    "通信が暗号化されている安全なサイトとして、検索エンジンに評価されやすくなります。",
  "JSON-LD":
    "構造化データ形式です。AI にページ内容を正確に伝えるために重要です。",
  favicon:
    "サイトのアイコンです。ブランド認識や検索結果での視認性に影響します。",
  "LLMs.txt":
    "AI クローラに“どのページをAI学習に使ってよいか”を指示するためのファイルです。",
};

// ---------------------------------------------
// 🔍 一つのテキスト内のキーワードを Tooltip に差し替える
// ---------------------------------------------
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderWithTooltips(text: string) {
  const elements: JSX.Element[] = [];
  let remaining = text;

  Object.keys(tooltipDictionary).forEach((key) => {
    const escaped = escapeRegExp(key); // ← ここ重要！
    const regex = new RegExp(escaped, "g");

    remaining = remaining.replace(regex, `[[[${key}]]]`);
  });

  // 分割
  const parts = remaining.split(/(\[\[\[.*?\]\]\])/g);

  parts.forEach((part, i) => {
    const match = part.match(/\[\[\[(.*?)\]\]\]/);

    if (match) {
      const keyword = match[1];
      elements.push(
        <Tooltip
          key={i}
          label={keyword}
          description={tooltipDictionary[keyword]}
        />
      );
    } else {
      elements.push(<span key={i}>{part}</span>);
    }
  });

  return <>{elements}</>;
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

  const colorClass = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={`${colorClass} border rounded-lg p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {Array.isArray(content) ? (
        <ul className="space-y-2">
          {content.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderWithTooltips(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{renderWithTooltips(content)}</p>
      )}
    </div>
  );
}
