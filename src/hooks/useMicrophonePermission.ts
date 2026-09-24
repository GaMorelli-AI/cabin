import { useCallback, useState } from "react";

type MicPermissionState = "idle" | "checking" | "granted" | "denied";

/**
 * Requests microphone access explicitly, once, before starting an
 * ElevenLabs session — so a denied/missing microphone can be shown as a
 * friendly retry screen instead of surfacing as a confusing connection error.
 * The stream itself is stopped right away; the SDK opens its own stream
 * when the session actually starts.
 */
export function useMicrophonePermission() {
  const [state, setState] = useState<MicPermissionState>("idle");

  const requestPermission = useCallback(async () => {
    setState("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setState("granted");
      return true;
    } catch {
      setState("denied");
      return false;
    }
  }, []);

  return { state, requestPermission };
}
