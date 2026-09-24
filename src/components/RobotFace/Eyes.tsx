import type { EyeParams } from "./expressions";

interface EyesProps {
  left: EyeParams;
  right: EyeParams;
  centerSpacing: number;
  cy: number;
  color: string;
}

function arcPath(rx: number, direction: 1 | -1) {
  const bow = rx * 0.85 * direction;
  return `M ${-rx} 0 Q 0 ${bow} ${rx} 0`;
}

function Eye({ params, cx, cy, color }: { params: EyeParams; cx: number; cy: number; color: string }) {
  const { rx, ry, arcAmount, arcDirection, rotation, offsetX, offsetY } = params;
  // Arc thickness is independent of ry (which only controls the round eye's
  // openness) so the arc stays a clean, thin curve at any expression.
  const strokeWidth = Math.min(Math.max(rx * 0.26, 6), 14);

  return (
    <g
      className="robot-eye"
      transform={`translate(${cx + offsetX} ${cy + offsetY}) rotate(${rotation})`}
    >
      <rect
        className="robot-eye__lid"
        x={-rx}
        y={-ry}
        width={rx * 2}
        height={Math.max(ry * 2, 0.001)}
        rx={Math.min(rx, ry)}
        ry={Math.min(rx, ry)}
        fill={color}
        opacity={1 - arcAmount}
      />
      <path
        className="robot-eye__arc"
        d={arcPath(rx, arcDirection)}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        opacity={arcAmount}
      />
    </g>
  );
}

export function Eyes({ left, right, centerSpacing, cy, color }: EyesProps) {
  return (
    <g className="robot-eyes">
      <Eye params={left} cx={-centerSpacing} cy={cy} color={color} />
      <Eye params={right} cx={centerSpacing} cy={cy} color={color} />
    </g>
  );
}
