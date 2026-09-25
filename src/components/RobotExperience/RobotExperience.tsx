import { useCallback, useEffect, useRef, useState } from "react";
import { RobotFace } from "../RobotFace/RobotFace";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";
import { SessionControls } from "../SessionControls/SessionControls";
import { StatusPanel } from "../StatusPanel/StatusPanel";
import { useRobotState } from "../../hooks/useRobotState";
import { useElevenLabsAgent } from "../../hooks/useElevenLabsAgent";
import { useAudioLevel } from "../../hooks/useAudioLevel";
import { useMicrophonePermission } from "../../hooks/useMicrophonePermission";
import { RECONNECT_INTERVAL } from "../../config/robotConfig";
import type { IdleExpression } from "../RobotFace/expressions";

const isDebugMode = new URLSearchParams(window.location.search).get("debug") === "true";
const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;

/**
 * The controller that wires ElevenLabs to the robot state machine and to
 * RobotFace: ElevenLabs (useElevenLabsAgent) -> RobotExperience -> robot
 * state (useRobotState) -> RobotFace. RobotFace itself never imports
 * anything ElevenLabs-related; it only ever receives `state` and
 * `audioLevel` (plus a purely informational idle-expression callback for
 * the status panel).
 */
export function RobotExperience() {
  const [hasStarted, setHasStarted] = useState(false);
  const [idleExpression, setIdleExpression] = useState<IdleExpression | null>(null);
  const [lastTransition, setLastTransition] = useState("—");
  const { state: robotState, dispatch, forceState } = useRobotState();
  const { state: micPermission, requestPermission } = useMicrophonePermission();
  const { status, conversationId, isSpeaking, startConversation, endConversation, getVolume } = useElevenLabsAgent({
    onEvent: dispatch,
  });

  const audioActive = robotState === "listening" || robotState === "thinking" || robotState === "speaking";
  const audioLevel = useAudioLevel(getVolume, audioActive);

  const prevStateRef = useRef(robotState);
  useEffect(() => {
    if (prevStateRef.current !== robotState) {
      setLastTransition(`${prevStateRef.current} → ${robotState}`);
    }
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

  const handleLigar = useCallback(async () => {
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

  // Reuses the same goodbye->idle pipeline the inactivity timeout and a
  // remote hangup already go through: this just dispatches the event, the
  // effect above ends the real session once the goodbye animation settles.
  const handleDesligar = useCallback(() => {
    if (status !== "connected") return;
    dispatch({ type: "conversationEnded" });
  }, [status, dispatch]);

  return (
    <div className="app">
      <RobotFace state={robotState} audioLevel={audioLevel} onIdleExpressionChange={setIdleExpression} />
      {robotState === "error" && <ErrorBanner />}

      <SessionControls status={status} onLigar={handleLigar} onDesligar={handleDesligar} />

      <StatusPanel
        robotState={robotState}
        idleExpression={idleExpression}
        connectionStatus={status}
        conversationId={conversationId}
        isAgentSpeaking={isSpeaking}
        microphonePermission={micPermission}
        audioLevel={audioLevel}
        agentId={AGENT_ID}
        lastTransition={lastTransition}
        debug={isDebugMode}
        onForceState={forceState}
      />
    </div>
  );
}
