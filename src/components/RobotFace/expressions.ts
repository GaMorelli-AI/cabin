import type { RobotState } from "../../types/robot";

export interface EyeParams {
  /** horizontal radius of the open/round eye shape, in local SVG units */
  rx: number;
  /** vertical radius (openness) of the open/round eye shape */
  ry: number;
  /** 0 = fully round/open eye, 1 = fully a thin arc (crossfaded) */
  arcAmount: number;
  /** 1 = smile-like arc (⌣ opening upward), -1 = worried arc */
  arcDirection: 1 | -1;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export interface ExpressionParams {
  leftEye: EyeParams;
  rightEye: EyeParams;
  /** -1 (frown) .. 0 (flat) .. 1 (big smile) */
  mouthCurve: number;
  mouthWidth: number;
  /** subtle horizontal shift of the mouth, for asymmetric/smirk-like looks */
  mouthOffsetX?: number;
  /** subtle overall gaze shift, -1..1 on each axis */
  gazeX: number;
  gazeY: number;
  /** whether this state gets the audio-reactive breathing pulse */
  breathing: boolean;
}

const eye = (overrides: Partial<EyeParams> = {}): EyeParams => ({
  rx: 30,
  ry: 30,
  arcAmount: 0,
  arcDirection: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  ...overrides,
});

export const EXPRESSIONS: Record<RobotState, ExpressionParams> = {
  idle: {
    leftEye: eye({ ry: 13, arcAmount: 0.85 }),
    rightEye: eye({ ry: 13, arcAmount: 0.85 }),
    mouthCurve: 0.25,
    mouthWidth: 66,
    gazeX: 0,
    gazeY: 0,
    breathing: false,
  },
  wake: {
    leftEye: eye({ ry: 34 }),
    rightEye: eye({ ry: 34 }),
    mouthCurve: 0.15,
    mouthWidth: 56,
    gazeX: 0,
    gazeY: 0,
    breathing: false,
  },
  listening: {
    leftEye: eye({ ry: 32 }),
    rightEye: eye({ ry: 32 }),
    mouthCurve: 0.1,
    mouthWidth: 52,
    gazeX: 0,
    gazeY: 0,
    breathing: true,
  },
  thinking: {
    leftEye: eye({ ry: 21, arcAmount: 0.2, offsetX: -8 }),
    rightEye: eye({ ry: 21, arcAmount: 0.2, offsetX: -8 }),
    mouthCurve: 0,
    mouthWidth: 30,
    gazeX: -0.7,
    gazeY: -0.12,
    breathing: false,
  },
  speaking: {
    leftEye: eye({ ry: 30 }),
    rightEye: eye({ ry: 30 }),
    mouthCurve: 0.2,
    mouthWidth: 68,
    gazeX: 0,
    gazeY: 0,
    breathing: false,
  },
  happy: {
    leftEye: eye({ ry: 19, arcAmount: 1, arcDirection: -1 }),
    rightEye: eye({ ry: 19, arcAmount: 1, arcDirection: -1 }),
    mouthCurve: 0.8,
    mouthWidth: 88,
    gazeX: 0,
    gazeY: 0,
    breathing: false,
  },
  confused: {
    leftEye: eye({ ry: 26, rotation: -8, offsetY: -5 }),
    rightEye: eye({ ry: 15, arcAmount: 0.55, rotation: 10, offsetY: 5 }),
    mouthCurve: -0.3,
    mouthWidth: 38,
    gazeX: 0.15,
    gazeY: 0,
    breathing: false,
  },
  goodbye: {
    leftEye: eye({ ry: 2, arcAmount: 0.3 }),
    rightEye: eye({ ry: 2, arcAmount: 0.3 }),
    mouthCurve: 0.5,
    mouthWidth: 72,
    gazeX: 0,
    gazeY: 0,
    breathing: false,
  },
  error: {
    leftEye: eye({ ry: 17, arcAmount: 0.3, rotation: -4 }),
    rightEye: eye({ ry: 13, arcAmount: 0.5, rotation: 6 }),
    mouthCurve: -0.2,
    mouthWidth: 34,
    gazeX: 0,
    gazeY: 0.08,
    breathing: false,
  },
};

/**
 * Idle's resting look. "wake" is the dominant, default expression — the
 * robot sits there alert and curious, not with a dedicated sleepy "idle
 * face" of its own. The other three are brief, occasional mood oscillations
 * (see useIdleBehavior) that always return to "wake"; they're deliberately
 * toned down from their full EXPRESSIONS counterparts (smaller gaze shift,
 * softer asymmetry, smaller smile) so they read as a passing flicker of
 * mood, not a state change.
 */
export type IdleExpression = "wake" | "thinking" | "confused" | "happy";

export const IDLE_EXPRESSIONS: Record<IdleExpression, ExpressionParams> = {
  wake: {
    leftEye: eye({ ry: 34 }),
    rightEye: eye({ ry: 34 }),
    mouthCurve: 0.15,
    mouthWidth: 56,
    gazeX: 0,
    gazeY: 0,
    breathing: false,
  },
  thinking: {
    leftEye: eye({ ry: 26, arcAmount: 0.12, offsetX: -5 }),
    rightEye: eye({ ry: 26, arcAmount: 0.12, offsetX: -5 }),
    mouthCurve: 0,
    mouthWidth: 34,
    gazeX: -0.4,
    gazeY: -0.08,
    breathing: false,
  },
  confused: {
    leftEye: eye({ ry: 30, rotation: -4, offsetY: -2 }),
    rightEye: eye({ ry: 22, arcAmount: 0.25, rotation: 5, offsetY: 3 }),
    mouthCurve: -0.15,
    mouthWidth: 40,
    gazeX: 0.1,
    gazeY: 0,
    breathing: false,
  },
  happy: {
    leftEye: eye({ ry: 17, arcAmount: 0.75, arcDirection: -1 }),
    rightEye: eye({ ry: 17, arcAmount: 0.75, arcDirection: -1 }),
    mouthCurve: 0.5,
    mouthWidth: 78,
    gazeX: 0,
    gazeY: 0,
    breathing: false,
  },
};
