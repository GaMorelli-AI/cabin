import { useEffect, useRef, useState } from "react";
import { AUDIO_SMOOTHING_FACTOR } from "../config/robotConfig";

/**
 * Polls a 0..1 volume supplier (e.g. the ElevenLabs SDK's
 * getInputVolume/getOutputVolume, which are themselves backed by the Web
 * Audio API) on every animation frame, smooths it, and only pushes the
 * result into React state a few times a second — enough for the mouth
 * animation to look fluid without re-rendering the whole tree at 60fps.
 */
export function useAudioLevel(getLevel: (() => number) | null, active: boolean) {
  const [level, setLevel] = useState(0);
  const levelRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastPushRef = useRef(0);

  useEffect(() => {
    if (!active || !getLevel) {
      levelRef.current = 0;
      setLevel(0);
      return;
    }

    const tick = (timestamp: number) => {
      const raw = getLevel();
      const smoothed = levelRef.current * AUDIO_SMOOTHING_FACTOR + raw * (1 - AUDIO_SMOOTHING_FACTOR);
      levelRef.current = smoothed;

      if (timestamp - lastPushRef.current > 66) {
        lastPushRef.current = timestamp;
        setLevel(smoothed);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, getLevel]);

  return level;
}
