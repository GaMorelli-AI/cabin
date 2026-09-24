import type { RobotState } from "../../types/robot";
import "./DebugPanel.css";

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

interface DebugPanelProps {
  robotState: RobotState;
  connectionStatus: string;
  conversationId: string | null;
  isAgentSpeaking: boolean;
  microphoneLevel: number;
  microphonePermission: string;
  onForceState: (state: RobotState) => void;
  onStartSession: () => void;
  onEndSession: () => void;
}

export function DebugPanel({
  robotState,
  connectionStatus,
  conversationId,
  isAgentSpeaking,
  microphoneLevel,
  microphonePermission,
  onForceState,
  onStartSession,
  onEndSession,
}: DebugPanelProps) {
  return (
    <div className="debug-panel">
      <h2>Debug</h2>
      <dl>
        <dt>Robot State</dt>
        <dd>{robotState}</dd>
        <dt>ElevenLabs status</dt>
        <dd>{connectionStatus}</dd>
        <dt>isSpeaking</dt>
        <dd>{isAgentSpeaking ? "yes" : "no"}</dd>
        <dt>Mic permission</dt>
        <dd>{microphonePermission}</dd>
        <dt>Microphone level</dt>
        <dd>{microphoneLevel.toFixed(2)}</dd>
        <dt>Conversation ID</dt>
        <dd className="debug-panel__id">{conversationId ?? "—"}</dd>
      </dl>

      <h3>Session</h3>
      <div className="debug-panel__buttons">
        <button onClick={onStartSession}>Start session</button>
        <button onClick={onEndSession}>End session</button>
      </div>

      <h3>Force state</h3>
      <div className="debug-panel__buttons">
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
    </div>
  );
}
