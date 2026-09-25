import { useEffect, useRef, useState } from "react";
import type { ConnectionStatus, RobotState } from "../../types/robot";
import type { IdleExpression } from "../RobotFace/expressions";
import "./StatusPanel.css";

const FORCEABLE_STATES: RobotState[] = [
  "idle",
  "wake",
  "listening",
  "thinking",
  "speaking",
  "happy",
  "confused",
  "goodbye",
  "error",
];

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connected: "online",
  connecting: "connecting",
  disconnected: "offline",
  error: "error",
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function maskAgentId(id: string | undefined) {
  if (!id) return "—";
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}•••${id.slice(-4)}`;
}

interface StatusPanelProps {
  robotState: RobotState;
  idleExpression: IdleExpression | null;
  connectionStatus: ConnectionStatus;
  conversationId: string | null;
  isAgentSpeaking: boolean;
  microphonePermission: string;
  audioLevel: number;
  agentId?: string;
  lastTransition: string;
  debug: boolean;
  onForceState: (state: RobotState) => void;
}

/**
 * Small always-available status indicator, collapsed by default so it never
 * competes with the face. Click to expand into a technical readout — handy
 * for following along during a live demo without needing ?debug=true.
 * The force-state grid only shows up when `debug` is true.
 */
export function StatusPanel({
  robotState,
  idleExpression,
  connectionStatus,
  conversationId,
  isAgentSpeaking,
  microphonePermission,
  audioLevel,
  agentId,
  lastTransition,
  debug,
  onForceState,
}: StatusPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (connectionStatus !== "connected") {
      sessionStartRef.current = null;
      setElapsedSeconds(0);
      return;
    }
    if (sessionStartRef.current === null) sessionStartRef.current = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - (sessionStartRef.current as number)) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [connectionStatus]);

  return (
    <div className={`status-panel${isExpanded ? " status-panel--expanded" : ""}`}>
      <button className="status-panel__toggle" onClick={() => setIsExpanded((v) => !v)}>
        <span className={`status-panel__dot status-panel__dot--${connectionStatus}`} />
        {isExpanded ? "Status" : `Cabin ${STATUS_LABEL[connectionStatus]}`}
      </button>

      {isExpanded && (
        <div className="status-panel__body">
          <dl>
            <dt>Robot State</dt>
            <dd>{robotState}</dd>
            {idleExpression && (
              <>
                <dt>Idle Expression</dt>
                <dd>{idleExpression}</dd>
              </>
            )}
            <dt>ElevenLabs Status</dt>
            <dd>{connectionStatus}</dd>
            <dt>Agent Speaking</dt>
            <dd>{isAgentSpeaking ? "true" : "false"}</dd>
            <dt>Microphone</dt>
            <dd>{microphonePermission}</dd>
            <dt>Audio Level</dt>
            <dd>{audioLevel.toFixed(2)}</dd>
            <dt>Conversation</dt>
            <dd className="status-panel__mono">{conversationId ?? "—"}</dd>
            <dt>Agent ID</dt>
            <dd className="status-panel__mono">{maskAgentId(agentId)}</dd>
            <dt>Last transition</dt>
            <dd>{lastTransition}</dd>
            <dt>Session</dt>
            <dd>{connectionStatus === "connected" ? formatDuration(elapsedSeconds) : "—"}</dd>
          </dl>

          {debug && (
            <>
              <h3>Force state</h3>
              <div className="status-panel__buttons">
                {FORCEABLE_STATES.map((state) => (
                  <button
                    key={state}
                    className={state === robotState ? "active" : ""}
                    onClick={() => onForceState(state)}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
