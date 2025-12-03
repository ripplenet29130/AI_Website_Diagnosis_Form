import { LucideIcon } from 'lucide-react';

interface ResultBlockProps {
  title: string;
  icon: LucideIcon;
  content: string | string[];
  color: string;
}

export default function ResultBlock({ title, icon: Icon, content, color }: ResultBlockProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
  };

  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`${colorClass} border rounded-lg p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {Array.isArray(content) ? (
        <ul className="space-y-2">
          {content.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              {/* ← ドット削除（AI側で付けているため） */}
              <span className="text-base leading-relaxed">{item.replace(/^・/, '・')}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}
