export const COLORS = {
  background: "#050708",
  primary: "#65F5ED",
  glow: "rgba(101, 245, 237, 0.35)",
  errorText: "rgba(255, 255, 255, 0.45)",
} as const;

/** Time of inactivity (ms) before the robot says goodbye and returns to idle. */
export const INACTIVITY_TIMEOUT = 45_000;

/** How long the WAKE expression holds before falling through to LISTENING. */
export const WAKE_DURATION = 900;

/** How long the GOODBYE expression holds before falling through to IDLE. */
export const GOODBYE_DURATION = 1600;

/** Idle micro-animation cadence, in ms, min/max between blinks. */
export const IDLE_BLINK_INTERVAL: [number, number] = [2500, 6000];

/** Idle micro-animation cadence, in ms, min/max between subtle eye drifts. */
export const IDLE_DRIFT_INTERVAL: [number, number] = [3500, 7000];

/**
 * Idle's resting look is "wake". Every so often (min/max, ms) we roll the
 * dice on a brief mood oscillation (thinking/confused/happy) instead of
 * staying put.
 */
export const IDLE_VARIATION_CHECK_INTERVAL: [number, number] = [3000, 7000];

/** Probability (0..1) that a given check actually triggers an oscillation. */
export const IDLE_VARIATION_CHANCE = 0.6;

/** How long (min/max, ms) a triggered oscillation holds before returning to wake. */
export const IDLE_VARIATION_DURATION: [number, number] = [1000, 2500];

/** Smoothing factor for audio level: smoothed = prev*FACTOR + current*(1-FACTOR). */
export const AUDIO_SMOOTHING_FACTOR = 0.75;

/** How often (ms) the reconnection loop retries after a connection error. */
export const RECONNECT_INTERVAL = 4000;
