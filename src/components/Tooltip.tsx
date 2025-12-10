import React from "react";

interface TooltipProps {
  label: string;
  description: string;
}

const Tooltip: React.FC<TooltipProps> = ({ label, description }) => {
  return (
    <span className="relative group cursor-help font-semibold text-gray-700">
      {label}

      {/* ツールチップ本体 */}
      <div
        className="
          absolute left-1/2 -translate-x-1/2 mt-2
          opacity-0 pointer-events-none
          group-hover:opacity-100 group-hover:pointer-events-auto
          transition-opacity duration-150
          bg-black text-white text-xs p-2 rounded shadow-lg w-56 z-50
        "
      >
        {description}
      </div>
    </span>
  );
};

export default Tooltip;
