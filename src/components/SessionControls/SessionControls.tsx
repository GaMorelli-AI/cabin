import type { ConnectionStatus } from "../../types/robot";
import "./SessionControls.css";

interface SessionControlsProps {
  status: ConnectionStatus;
  isMuted: boolean;
  onLigar: () => void;
  onDesligar: () => void;
  onToggleMute: () => void;
}

/**
 * The only way to start/stop a conversation in the production UI: two
 * small, unobtrusive buttons near the bottom of the screen. They drive the
 * ElevenLabs session directly (via the handlers RobotExperience passes in)
 * and never compete visually with the face.
 */
export function SessionControls({ status, isMuted, onLigar, onDesligar, onToggleMute }: SessionControlsProps) {
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
      <button
        className={`session-controls__button${isMuted ? " session-controls__button--muted" : ""}`}
        onClick={onToggleMute}
        disabled={!isConnected}
        aria-pressed={isMuted}
        title={isMuted ? "Microfone mutado — o Cabin não te ouve" : "Mutar o microfone (evita interrupções por ruído)"}
      >
        {isMuted ? "Desmutar" : "Mutar"}
      </button>
    </div>
  );
}
