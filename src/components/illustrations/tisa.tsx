import { cn } from "@/lib/utils";

// Tisa (Filipino for "chalk"), the CarSUComits mascot: an original chalk-stick character.
// Colours come from theme variables, so Tisa works on paper and on the dark board.

export type TisaPose = "wave" | "hold" | "sleep" | "cheer" | "lost" | "search";

const INK = "rgb(var(--c-board-deep))";
const CHALK = "rgb(var(--c-chalk))";
const PAPER = "rgb(var(--c-surface))";
const CHEEK = "rgb(var(--c-coral-300))";
const GOLD = "rgb(var(--c-gold-400))";
const CORAL = "rgb(var(--c-coral-400))";
const GREEN = "rgb(var(--c-brand-500))";
const line = { stroke: INK, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

function Sparkle({ x, y, s = 1, color = GOLD }: { x: number; y: number; s?: number; color?: string }) {
  return <path d={`M${x} ${y - 7 * s}q${1.5 * s} ${5.5 * s} ${7 * s} ${7 * s}q${-5.5 * s} ${1.5 * s} ${-7 * s} ${7 * s}q${-1.5 * s} ${-5.5 * s} ${-7 * s} ${-7 * s}q${5.5 * s} ${-1.5 * s} ${7 * s} ${-7 * s}Z`} fill={color} />;
}

function Face({ pose }: { pose: TisaPose }) {
  if (pose === "sleep") {
    return (
      <g>
        <path d="M68 72q4 4 8 0M84 72q4 4 8 0" {...line} strokeWidth={3} />
        <circle cx="80" cy="86" r="3" fill={INK} />
      </g>
    );
  }
  const look = pose === "lost" ? -2 : 0;
  return (
    <g>
      <circle cx={72 + look} cy={71 + look} r="3.8" fill={INK} />
      <circle cx={88 + look} cy={71 + look} r="3.8" fill={INK} />
      {pose === "cheer" ? (
        <path d="M71 81q9 11 18 0Z" fill={INK} />
      ) : pose === "lost" ? (
        <path d="M74 87q6-3 12 0" {...line} strokeWidth={3} />
      ) : (
        <path d="M73 83q7 7 14 0" {...line} strokeWidth={3} />
      )}
      <circle cx="65" cy="81" r="4" fill={CHEEK} opacity=".85" />
      <circle cx="95" cy="81" r="4" fill={CHEEK} opacity=".85" />
    </g>
  );
}

function Arms({ pose }: { pose: TisaPose }) {
  switch (pose) {
    case "wave":
      return (
        <g>
          <path d="M58 92 44 106" {...line} />
          <path d="M102 90 118 64" {...line} />
          <circle cx="120" cy="59" r="6" fill={CHALK} stroke={INK} strokeWidth={3.5} />
          <path d="M131 50q5 6 1 13M137 45q7 9 1 20" {...line} strokeWidth={2.5} opacity=".55" />
        </g>
      );
    case "cheer":
      return (
        <g>
          <path d="M58 90 40 64M102 90 120 64" {...line} />
          <circle cx="38" cy="59" r="6" fill={CHALK} stroke={INK} strokeWidth={3.5} />
          <circle cx="122" cy="59" r="6" fill={CHALK} stroke={INK} strokeWidth={3.5} />
        </g>
      );
    case "hold":
      return (
        <g>
          <path d="M58 92 60 104M102 92 100 104" {...line} />
          <g transform="rotate(-5 80 110)">
            <rect x="52" y="98" width="56" height="34" rx="5" fill={PAPER} stroke={INK} strokeWidth={3.5} />
            <path d="M64 115l7 7 14-15" stroke={GREEN} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="80" cy="97" r="5" fill={GOLD} stroke={INK} strokeWidth={2.5} />
          </g>
        </g>
      );
    case "lost":
      return (
        <g>
          <path d="M58 92 44 106" {...line} />
          <path d="M102 90 108 64 98 44" {...line} />
          <path d="M118 22q0-10 10-10t10 9q0 7-10 10v6" {...line} stroke={GOLD} strokeWidth={4.5} />
          <circle cx="128" cy="47" r="3" fill={GOLD} />
        </g>
      );
    case "search":
      return (
        <g>
          <path d="M58 92 44 106" {...line} />
          <path d="M102 92 116 100" {...line} />
          <circle cx="126" cy="104" r="12" fill={PAPER} fillOpacity=".6" stroke={INK} strokeWidth={4} />
          <path d="M134 113 144 124" {...line} strokeWidth={5} />
        </g>
      );
    default:
      return <path d="M58 92 46 108M102 92 114 108" {...line} />;
  }
}

/** Tisa in one of six poses. Decorative by default; pass a label when she carries meaning. */
export function Tisa({ pose = "wave", label, className }: { pose?: TisaPose; label?: string; className?: string }) {
  return (
    <svg viewBox="0 0 160 160" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cn("shrink-0", className)}>
      <ellipse cx="80" cy="148" rx="34" ry="5" fill="rgb(var(--shadow))" opacity=".12" />
      {/* Chalk dust, the stick's own trail */}
      <circle cx="30" cy="120" r="2.5" fill="rgb(var(--c-chalk-dust))" />
      <circle cx="136" cy="132" r="2" fill="rgb(var(--c-chalk-dust))" />
      <circle cx="24" cy="92" r="1.6" fill="rgb(var(--c-chalk-dust))" />
      {/* Legs and feet */}
      <path d="M72 124 70 142M88 124 90 142" {...line} />
      <path d="M62 143h9M89 143h9" {...line} />
      <Arms pose={pose} />
      {/* The chalk stick body, worn at the top */}
      <rect x="58" y="34" width="44" height="92" rx="15" fill={CHALK} stroke={INK} strokeWidth={4} />
      <path d="M62 47q18-9 36-3" stroke="rgb(var(--c-chalk-dust))" strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M64 110h10M86 116h8" stroke="rgb(var(--c-chalk-dust))" strokeWidth={2.5} strokeLinecap="round" />
      <Face pose={pose} />
      {pose === "sleep" && <path d="M112 44h10l-10 12h10M128 26h7l-7 9h7" {...line} strokeWidth={3} opacity=".7" />}
      {pose === "cheer" && (
        <g>
          <Sparkle x={24} y={40} />
          <Sparkle x={140} y={32} s={0.8} color={CORAL} />
          <Sparkle x={146} y={84} s={0.6} />
          <Sparkle x={16} y={78} s={0.6} color={CORAL} />
        </g>
      )}
      {pose === "wave" && <Sparkle x={30} y={42} s={0.7} />}
    </svg>
  );
}
