export type RobotState =
  | "idle"
  | "wake"
  | "listening"
  | "thinking"
  | "speaking"
  | "happy"
  | "confused"
  | "goodbye"
  | "error";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface RobotStatusSnapshot {
  state: RobotState;
  connectionStatus: ConnectionStatus;
  conversationId: string | null;
  isAgentSpeaking: boolean;
  microphoneLevel: number;
}

/**
 * Provider-agnostic events. Any voice backend (ElevenLabs today, something
 * else tomorrow) is translated into this set before reaching the robot's
 * control layer, so RobotFace and useRobotState never depend on a vendor SDK.
 */
export type ConversationEvent =
  | { type: "conversationStarted"; conversationId: string }
  | { type: "agentListening" }
  | { type: "userStoppedSpeaking" }
  | { type: "agentSpeaking" }
  | { type: "agentHappy" }
  | { type: "agentConfused" }
  | { type: "conversationEnded" }
  | { type: "connectionError"; message?: string };
