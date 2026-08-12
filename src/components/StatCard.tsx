interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brand-grey font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-brand-grey mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
