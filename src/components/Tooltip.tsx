import React from "react";

interface TooltipProps {
  label: string;
  description: string;
}

const Tooltip: React.FC<TooltipProps> = ({ label, description }) => {
  return (
    <span className="relative group cursor-pointer font-semibold text-blue-700 underline decoration-dotted">
      {label}

      {/* Tooltip 本体（右側に表示） */}
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
