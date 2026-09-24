import { useIdleBehavior } from "../../hooks/useIdleBehavior";
import { COLORS } from "../../config/robotConfig";
import type { RobotState } from "../../types/robot";
import { EXPRESSIONS, IDLE_EXPRESSIONS } from "./expressions";
import { Eyes } from "./Eyes";
import { Mouth } from "./Mouth";
import "./RobotFace.css";

interface RobotFaceProps {
  state: RobotState;
  audioLevel: number;
}

const VIEWBOX_W = 320;
const VIEWBOX_H = 420;
const EYE_SPACING = 62;
const EYE_CY = 180;
const MOUTH_CY = 268;
const DRIFT_PX = 6;
const GAZE_PX = 34;

export function RobotFace({ state, audioLevel }: RobotFaceProps) {
  const isIdle = state === "idle";
  const { isBlinking, drift, idleExpression } = useIdleBehavior(isIdle);
  const expression = isIdle ? IDLE_EXPRESSIONS[idleExpression] : EXPRESSIONS[state];

  const blinkScale = isBlinking ? 0.04 : 1;
  const breathingScale = expression.breathing ? 1 + audioLevel * 0.05 : 1;

  const driftX = isIdle ? drift.x * DRIFT_PX : 0;
  const driftY = isIdle ? drift.y * DRIFT_PX : 0;
  const gazeX = expression.gazeX * GAZE_PX;
  const gazeY = expression.gazeY * GAZE_PX;

  const applyBlink = (ry: number) => (isIdle || state === "listening" || state === "wake" ? ry * blinkScale : ry);

  const leftEye = { ...expression.leftEye, ry: applyBlink(expression.leftEye.ry) };
  const rightEye = { ...expression.rightEye, ry: applyBlink(expression.rightEye.ry) };

  return (
    <svg
      className={`robot-face robot-face--${state}`}
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      role="img"
      aria-label={`Personagem, estado: ${state}${isIdle ? `, ${idleExpression}` : ""}`}
    >
      {/* Barely-there breathing/floating motion, active only while idle, so
          the character never reads as perfectly frozen between interactions. */}
      <g className={`robot-face__breathe${isIdle ? " robot-face__breathe--active" : ""}`}>
        <g
          className="robot-face__group"
          style={{
            transform: `translate(${VIEWBOX_W / 2 + driftX + gazeX}px, ${EYE_CY + driftY + gazeY}px) scale(${breathingScale})`,
          }}
        >
          <Eyes left={leftEye} right={rightEye} centerSpacing={EYE_SPACING} cy={0} color={COLORS.primary} />
        </g>
        <Mouth
          cx={VIEWBOX_W / 2 + driftX * 0.5 + (expression.mouthOffsetX ?? 0)}
          cy={MOUTH_CY + driftY * 0.5}
          curve={expression.mouthCurve}
          width={expression.mouthWidth}
          color={COLORS.primary}
          isSpeaking={state === "speaking"}
          audioLevel={audioLevel}
        />
      </g>
    </svg>
  );
}
