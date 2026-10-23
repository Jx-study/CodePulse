interface MilestoneFigureProps {
  index: number;
  className?: string;
}

// 每個里程碑的迷你資料結構線稿（畫當期做的東西）
function MilestoneFigure({ index, className }: MilestoneFigureProps) {
  switch (index) {
    case 0:
      return (
        <svg className={className} viewBox="0 0 120 90">
          <rect x="35" y="64" width="50" height="14" rx="2" />
          <rect x="35" y="46" width="50" height="14" rx="2" />
          <rect x="35" y="28" width="50" height="14" rx="2" />
          <rect x="35" y="2" width="50" height="14" rx="2" strokeDasharray="4 3" />
          <path d="M60 18 v6 m0 0 l-4 -4 m4 4 l4 -4" />
        </svg>
      );
    case 1:
      return (
        <svg className={className} viewBox="0 0 120 90">
          <circle cx="60" cy="14" r="8" />
          <circle cx="35" cy="45" r="8" />
          <circle cx="85" cy="45" r="8" />
          <circle cx="22" cy="76" r="8" />
          <circle cx="48" cy="76" r="8" />
          <path d="M54 20 L41 39 M66 20 L79 39 M31 52 L26 68 M39 52 L44 68" />
        </svg>
      );
    case 2:
      return (
        <svg className={className} viewBox="0 0 120 90">
          <ellipse cx="52" cy="18" rx="26" ry="9" />
          <path d="M26 18 V62 a26 9 0 0 0 52 0 V18 M26 40 a26 9 0 0 0 52 0" />
          <circle cx="98" cy="66" r="12" />
          <path d="M92 66 l4 4 l8 -8" />
        </svg>
      );
    case 3:
      return (
        <svg className={className} viewBox="0 0 120 90">
          <rect x="4" y="38" width="24" height="18" rx="3" />
          <rect x="48" y="38" width="24" height="18" rx="3" />
          <rect x="92" y="38" width="24" height="18" rx="3" />
          <path d="M30 47 h14 m0 0 l-4 -4 m4 4 l-4 4 M74 47 h14 m0 0 l-4 -4 m4 4 l-4 4" />
          <path d="M104 12 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" />
        </svg>
      );
    case 4:
      return (
        <svg className={className} viewBox="0 0 120 90">
          <circle cx="60" cy="14" r="8" />
          <circle cx="36" cy="44" r="8" />
          <circle cx="84" cy="44" r="8" />
          <circle cx="22" cy="75" r="8" />
          <circle cx="48" cy="75" r="8" />
          <circle cx="72" cy="75" r="8" />
          <circle cx="96" cy="75" r="8" />
          <path d="M54 19 L41 38 M66 19 L79 38 M32 51 L26 68 M40 51 L45 68 M80 51 L74 68 M88 51 L93 68" />
        </svg>
      );
    default:
      return null;
  }
}

export default MilestoneFigure;
