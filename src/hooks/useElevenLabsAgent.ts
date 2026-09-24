import { useCallback, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { resolveConnectionConfig } from "../services/elevenlabs";
import type { ConversationEvent } from "../types/robot";

interface UseElevenLabsAgentOptions {
  /** Receives provider-agnostic events; feed these straight into useRobotState().dispatch. */
  onEvent: (event: ConversationEvent) => void;
}

/**
 * The only place in the app that talks to @elevenlabs/react. Wraps
 * useConversation() and translates its callback stream into the
 * ConversationEvent union the rest of the app understands. Swapping voice
 * providers later means rewriting this hook (and services/elevenlabs.ts),
 * not RobotFace or useRobotState.
 *
 * Must be rendered under a <ConversationProvider>.
 */
export function useElevenLabsAgent({ onEvent }: UseElevenLabsAgentOptions) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const [conversationId, setConversationId] = useState<string | null>(null);
  // Set right before we call endSession() ourselves, so the resulting
  // onDisconnect doesn't re-trigger the goodbye->idle sequence a second time.
  const endedByUsRef = useRef(false);

  const conversation = useConversation({
    onConnect: ({ conversationId: id }) => {
      setConversationId(id);
      onEventRef.current({ type: "conversationStarted", conversationId: id });
    },
    onModeChange: ({ mode }) => {
      onEventRef.current(mode === "speaking" ? { type: "agentSpeaking" } : { type: "agentListening" });
    },
    onMessage: ({ role }) => {
      if (role === "user") onEventRef.current({ type: "userStoppedSpeaking" });
    },
    onError: (message) => {
      onEventRef.current({ type: "connectionError", message });
    },
    onDisconnect: (details) => {
      setConversationId(null);
      if (endedByUsRef.current) {
        endedByUsRef.current = false;
        return;
      }
      // An error-caused disconnect is already represented by the "error"
      // state from onError above; don't clobber it with goodbye/idle, or
      // the reconnect loop (which only runs while in "error") would stop.
      if (details.reason === "error") return;
      onEventRef.current({ type: "conversationEnded" });
    },
  });

  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  const startConversation = useCallback(async () => {
    const config = await resolveConnectionConfig();
    if (config.mode === "agentId") {
      conversationRef.current.startSession({ agentId: config.agentId });
    } else if (config.mode === "signedUrl") {
      conversationRef.current.startSession({ signedUrl: config.signedUrl });
    } else {
      conversationRef.current.startSession({ conversationToken: config.conversationToken });
    }
  }, []);

  const endConversation = useCallback(() => {
    endedByUsRef.current = true;
    conversationRef.current.endSession();
  }, []);

  const getVolume = useCallback(() => {
    const c = conversationRef.current;
    if (c.status !== "connected") return 0;
    return c.mode === "speaking" ? c.getOutputVolume() : c.getInputVolume();
  }, []);

  return {
    status: conversation.status,
    conversationId,
    isSpeaking: conversation.isSpeaking,
    startConversation,
    endConversation,
    getVolume,
  };
}
