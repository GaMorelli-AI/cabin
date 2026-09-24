import { useCallback, useEffect, useRef, useState } from "react";
import { RobotFace } from "../RobotFace/RobotFace";
import { StartScreen } from "../StartScreen/StartScreen";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";
import { DebugPanel } from "../DebugPanel/DebugPanel";
import { useRobotState } from "../../hooks/useRobotState";
import { useElevenLabsAgent } from "../../hooks/useElevenLabsAgent";
import { useAudioLevel } from "../../hooks/useAudioLevel";
import { useMicrophonePermission } from "../../hooks/useMicrophonePermission";
import { RECONNECT_INTERVAL } from "../../config/robotConfig";

const isDebugMode = new URLSearchParams(window.location.search).get("debug") === "true";

/**
 * The controller that wires ElevenLabs to the robot state machine and to
 * RobotFace: ElevenLabs (useElevenLabsAgent) -> RobotExperience -> robot
 * state (useRobotState) -> RobotFace. RobotFace itself never imports
 * anything ElevenLabs-related; it only ever receives `state` and
 * `audioLevel`.
 */
export function RobotExperience() {
  const [hasStarted, setHasStarted] = useState(false);
  const { state: robotState, dispatch, forceState } = useRobotState();
  const { state: micPermission, requestPermission } = useMicrophonePermission();
  const { status, conversationId, isSpeaking, startConversation, endConversation, getVolume } = useElevenLabsAgent({
    onEvent: dispatch,
  });

  const audioActive = robotState === "listening" || robotState === "thinking" || robotState === "speaking";
  const audioLevel = useAudioLevel(getVolume, audioActive);

  const prevStateRef = useRef(robotState);
  useEffect(() => {
    if (prevStateRef.current === "goodbye" && robotState === "idle") {
      endConversation();
      setHasStarted(false);
    }
    prevStateRef.current = robotState;
  }, [robotState, endConversation]);

  // Kiosk requirement: never leave the totem stuck on a technical error —
  // keep retrying quietly until the connection comes back.
  useEffect(() => {
    if (robotState !== "error" || !hasStarted) return;
    const interval = window.setInterval(() => {
      startConversation().catch(() => {});
    }, RECONNECT_INTERVAL);
    return () => window.clearInterval(interval);
  }, [robotState, hasStarted, startConversation]);

  const beginConversation = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      dispatch({ type: "connectionError", message: "Não foi possível acessar o microfone" });
      return;
    }

    document.documentElement.requestFullscreen?.().catch(() => {});

    setHasStarted(true);
    try {
      await startConversation();
    } catch {
      dispatch({ type: "connectionError", message: "Falha ao iniciar conversa" });
    }
  }, [requestPermission, startConversation, dispatch]);

  // Debug-only: start/end a real ElevenLabs session without going through
  // the start screen, so the full pipeline can be exercised while forcing
  // expressions in between.
  const handleDebugEndSession = useCallback(() => {
    endConversation();
    forceState("idle");
    setHasStarted(false);
  }, [endConversation, forceState]);

  // Debug mode bypasses the start screen so every expression can be forced
  // and inspected without going through microphone permission / ElevenLabs.
  const showFace = hasStarted || isDebugMode;

  return (
    <div className="app">
      {!showFace ? (
        <StartScreen onStart={beginConversation} micDenied={micPermission === "denied"} connecting={micPermission === "checking"} />
      ) : (
        <>
          <RobotFace state={robotState} audioLevel={audioLevel} />
          {robotState === "error" && <ErrorBanner />}
        </>
      )}

      {isDebugMode && (
        <DebugPanel
          robotState={robotState}
          connectionStatus={status}
          conversationId={conversationId}
          isAgentSpeaking={isSpeaking}
          microphoneLevel={audioLevel}
          microphonePermission={micPermission}
          onForceState={forceState}
          onStartSession={beginConversation}
          onEndSession={handleDebugEndSession}
        />
      )}
    </div>
  );
}
