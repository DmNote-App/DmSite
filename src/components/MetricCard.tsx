import type { CSSProperties, ReactNode } from "react";

type MetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  accentClassName?: string;
  className?: string;
  style?: CSSProperties;
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accentClassName = "bg-brand",
  className,
  style
}: MetricCardProps) {
  return (
    <div className={`ui-card flex h-full flex-col justify-between hover:bg-surface-hover transition-colors ${className ?? ""}`} style={style}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-grey-500">{title}</p>
          {icon && (
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${accentClassName} text-white`}>
              {icon}
            </div>
          )}
        </div>
        <div className="mt-2 text-3xl font-bold text-grey-900 tracking-tight">{value}</div>
      </div>

      {subtitle ? (
        <p className="mt-3 text-sm font-medium text-grey-400">{subtitle}</p>
      ) : null}
    </div>
  );
}
