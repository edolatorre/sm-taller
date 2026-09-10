interface StatusBadgeProps {
  label: string;
  color: string;
}

export default function StatusBadge({ label, color }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}
    >
      {label}
    </span>
  );
}
