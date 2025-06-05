import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  count: number;
  description: string;
  icon?: LucideIcon;
  color:string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  description,
  icon: Icon,
  color,
}) => {
  return (
    <div className="">
      {Icon && (
        <div className= {color}>
          <Icon size={20} />
        </div>
      )}

      {/* Contenu */}
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-xs text-gray-400">{description}</p>

    </div>
  );
};
