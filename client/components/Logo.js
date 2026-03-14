export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-sm', dot: 'w-2 h-2' },
    md: { icon: 36, text: 'text-lg', dot: 'w-2.5 h-2.5' },
    lg: { icon: 44, text: 'text-xl', dot: 'w-3 h-3' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <svg width={s.icon} height={s.icon} viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="8" fill="#0f172a"/>
        <path d="M10 26V10L18 18L26 10V26" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="18" cy="18" r="2.5" fill="#14b8a6"/>
      </svg>
      <span className={`font-semibold ${s.text} text-white`}>NeoConnect</span>
    </div>
  );
}