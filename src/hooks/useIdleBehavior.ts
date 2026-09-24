import { useEffect, useRef, useState } from "react";
import {
  IDLE_BLINK_INTERVAL,
  IDLE_DRIFT_INTERVAL,
  IDLE_VARIATION_CHANCE,
  IDLE_VARIATION_CHECK_INTERVAL,
  IDLE_VARIATION_DURATION,
} from "../config/robotConfig";
import type { IdleExpression } from "../components/RobotFace/expressions";

const TRANSIENT_EXPRESSIONS: IdleExpression[] = ["thinking", "confused", "happy"];

function randomBetween([min, max]: [number, number]) {
  return min + Math.random() * (max - min);
}

function pickTransientExpression(): IdleExpression {
  return TRANSIENT_EXPRESSIONS[Math.floor(Math.random() * TRANSIENT_EXPRESSIONS.length)];
}

export interface IdleBehavior {
  /** true for the brief moment the character blinks. */
  isBlinking: boolean;
  /** subtle eye offset, in the -1..1 range on each axis. */
  drift: { x: number; y: number };
  /** "wake" is the dominant resting look; the others are brief, occasional mood oscillations that always return to "wake". */
  idleExpression: IdleExpression;
}

/**
 * Everything that makes IDLE feel alive instead of frozen: random blinks, a
 * slow gaze drift, and an occasional brief mood oscillation away from the
 * "wake" resting look (thinking/confused/happy) that always settles back.
 * The robot's externally-visible state stays "idle" the whole time — this
 * only drives internal, subtle variation on top of it. Runs on plain
 * timeouts (no rAF, no per-frame React updates) since none of this needs to
 * change more than a few times a minute.
 */
export function useIdleBehavior(active: boolean): IdleBehavior {
  const [isBlinking, setIsBlinking] = useState(false);
  const [drift, setDrift] = useState({ x: 0, y: 0 });
  const [idleExpression, setIdleExpression] = useState<IdleExpression>("wake");
  const blinkTimer = useRef<number | null>(null);
  const driftTimer = useRef<number | null>(null);
  const variationCheckTimer = useRef<number | null>(null);
  const variationHoldTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setIsBlinking(false);
      setDrift({ x: 0, y: 0 });
      setIdleExpression("wake");
      return;
    }

    const scheduleBlink = () => {
      blinkTimer.current = window.setTimeout(() => {
        setIsBlinking(true);
        window.setTimeout(() => setIsBlinking(false), 160);
        scheduleBlink();
      }, randomBetween(IDLE_BLINK_INTERVAL));
    };

    const scheduleDrift = () => {
      driftTimer.current = window.setTimeout(() => {
        setDrift({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 });
        scheduleDrift();
      }, randomBetween(IDLE_DRIFT_INTERVAL));
    };

    // "wake" is the dominant resting look. Every few seconds we roll the
    // dice on a brief mood oscillation instead of staying put; most rolls
    // do nothing, and every triggered oscillation always returns to wake.
    const scheduleVariationCheck = () => {
      variationCheckTimer.current = window.setTimeout(() => {
        if (Math.random() < IDLE_VARIATION_CHANCE) {
          setIdleExpression(pickTransientExpression());
          variationHoldTimer.current = window.setTimeout(() => {
            setIdleExpression("wake");
            scheduleVariationCheck();
          }, randomBetween(IDLE_VARIATION_DURATION));
        } else {
          scheduleVariationCheck();
        }
      }, randomBetween(IDLE_VARIATION_CHECK_INTERVAL));
    };

    scheduleBlink();
    scheduleDrift();
    scheduleVariationCheck();

    return () => {
      if (blinkTimer.current !== null) window.clearTimeout(blinkTimer.current);
      if (driftTimer.current !== null) window.clearTimeout(driftTimer.current);
      if (variationCheckTimer.current !== null) window.clearTimeout(variationCheckTimer.current);
      if (variationHoldTimer.current !== null) window.clearTimeout(variationHoldTimer.current);
    };
  }, [active]);

  return { isBlinking, drift, idleExpression };
}
