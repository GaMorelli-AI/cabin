import type { ConnectionStatus } from "../../types/robot";
import "./SessionControls.css";

interface SessionControlsProps {
  status: ConnectionStatus;
  onLigar: () => void;
  onDesligar: () => void;
}

/**
 * The only way to start/stop a conversation in the production UI: two
 * small, unobtrusive buttons near the bottom of the screen. They drive the
 * ElevenLabs session directly (via the handlers RobotExperience passes in)
 * and never compete visually with the face.
 */
export function SessionControls({ status, onLigar, onDesligar }: SessionControlsProps) {
  const isConnecting = status === "connecting";
  const isConnected = status === "connected";

  return (
    <div className="session-controls">
      <button className="session-controls__button" onClick={onLigar} disabled={isConnecting || isConnected}>
        {isConnecting ? "Conectando…" : "Ligar"}
      </button>
      <button className="session-controls__button" onClick={onDesligar} disabled={!isConnected}>
        Desligar
      </button>
    </div>
  );
}
