import React from "react";
import { HelpCircle } from "lucide-react"; // ← アイコン追加（lucide-react）

interface TooltipProps {
  label: string;
  description: string;
}

const Tooltip: React.FC<TooltipProps> = ({ label, description }) => {
  return (
    <span className="relative group inline-flex items-center gap-1">
      {/* ラベル部分（青＋下線） */}
        <span className="relative group cursor-pointer font-semibold text-blue-700 underline decoration-dotted">
        {label}
      </span>

      {/* ? アイコン */}
      <HelpCircle
        size={16}
        className="text-blue-500 cursor-pointer group-hover:text-blue-700"
      />

      {/* Tooltip 本体（右側表示） */}
      <div
        className="
          absolute left-full top-1/2 -translate-y-1/2 ml-3
          opacity-0 group-hover:opacity-100
          pointer-events-none
          transition-opacity duration-150
          bg-black text-white text-xs p-3 rounded shadow-lg w-56 z-50
        "
      >
        {description}
      </div>
    </span>
  );
};

export default Tooltip;
