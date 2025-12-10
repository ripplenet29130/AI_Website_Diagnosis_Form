import React from "react";

interface TooltipProps {
  label: string;        // 表示するキーワード
  description: string;  // ホバーした時に表示する説明
}

const Tooltip: React.FC<TooltipProps> = ({ label, description }) => {
  return (
    <span className="relative group cursor-help font-semibold text-gray-700">
      {label}
      <div
        className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block
                   bg-black text-white text-xs p-2 rounded shadow-lg w-56 z-50"
      >
        {description}
      </div>
    </span>
  );
};

export default Tooltip;
