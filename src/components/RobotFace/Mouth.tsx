interface MouthProps {
  cx: number;
  cy: number;
  curve: number;
  width: number;
  color: string;
  isSpeaking: boolean;
  audioLevel: number;
}

/** Maps smoothed 0..1 audio level to an open-mouth vertical radius. */
function audioToOpenness(level: number) {
  if (level < 0.06) return 5;
  if (level < 0.35) return 10 + level * 30;
  if (level < 0.7) return 18 + level * 30;
  return Math.min(46, 26 + level * 30);
}

export function Mouth({ cx, cy, curve, width, color, isSpeaking, audioLevel }: MouthProps) {
  const halfWidth = width / 2;
  const bow = halfWidth * 0.6 * curve;
  const smilePath = `M ${cx - halfWidth} ${cy} Q ${cx} ${cy + bow} ${cx + halfWidth} ${cy}`;

  const openRy = audioToOpenness(audioLevel);
  const openRx = Math.max(halfWidth * 0.55, 14);

  return (
    <g className="robot-mouth">
      <path
        className="robot-mouth__curve"
        d={smilePath}
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        opacity={isSpeaking ? 0 : 1}
      />
      <ellipse
        className="robot-mouth__open"
        cx={cx}
        cy={cy + 4}
        rx={openRx}
        ry={openRy}
        fill={color}
        opacity={isSpeaking ? 1 : 0}
      />
    </g>
  );
}
