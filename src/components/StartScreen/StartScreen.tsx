import { RobotFace } from "../RobotFace/RobotFace";
import "./StartScreen.css";

interface StartScreenProps {
  onStart: () => void;
  micDenied: boolean;
  connecting: boolean;
}

export function StartScreen({ onStart, micDenied, connecting }: StartScreenProps) {
  return (
    <button className="start-screen" onClick={onStart} disabled={connecting}>
      <RobotFace state="idle" audioLevel={0} />
      <span className="start-screen__title">Olá.</span>
      <span className="start-screen__hint">
        {micDenied ? "Não consegui acessar o microfone. Toque para tentar de novo." : connecting ? "Conectando..." : "Toque para falar comigo"}
      </span>
    </button>
  );
}
