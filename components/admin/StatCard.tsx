import { Icon } from "@phosphor-icons/react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: Icon;
  subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, subtitle }: StatCardProps) {
  return (
    <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
      <div className="p-3 bg-teal-500/10 text-teal-600 rounded-lg">
        <Icon size={28} weight="duotone" />
      </div>
      <div>
        <p className="text-zinc-500 font-sans text-sm mb-1">{title}</p>
        <h3 className="font-heading font-semibold text-zinc-900 text-2xl tracking-wide">
          {value}
        </h3>
        {subtitle && (
          <p className="text-zinc-400 font-sans text-xs mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
