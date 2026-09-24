import { useCallback, useEffect, useRef, useState } from "react";
import { GOODBYE_DURATION, INACTIVITY_TIMEOUT, WAKE_DURATION } from "../config/robotConfig";
import type { ConversationEvent, RobotState } from "../types/robot";

const TRANSIENT_EXPRESSION_DURATION = 1800;

/**
 * Pure visual state machine for the robot's face. Knows nothing about
 * ElevenLabs or any other voice backend — it only reacts to the
 * provider-agnostic ConversationEvent union and to its own internal timers
 * (wake→listening, goodbye→idle, transient happy/confused, inactivity).
 */
export function useRobotState() {
  const [state, setState] = useState<RobotState>("idle");
  const isConversationActiveRef = useRef(false);
  const lastActivityRef = useRef(Date.now());
  const timeoutRef = useRef<number | null>(null);

  const clearPendingTimeout = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const goIdle = useCallback(() => {
    isConversationActiveRef.current = false;
    setState("idle");
  }, []);

  const forceState = useCallback((next: RobotState) => {
    clearPendingTimeout();
    lastActivityRef.current = Date.now();
    setState(next);
  }, []);

  const dispatch = useCallback((event: ConversationEvent) => {
    clearPendingTimeout();
    lastActivityRef.current = Date.now();

    switch (event.type) {
      case "conversationStarted":
        isConversationActiveRef.current = true;
        setState("wake");
        timeoutRef.current = window.setTimeout(() => setState("listening"), WAKE_DURATION);
        break;

      case "agentListening":
        setState("listening");
        break;

      case "userStoppedSpeaking":
        setState("thinking");
        break;

      case "agentSpeaking":
        setState("speaking");
        break;

      case "agentHappy":
        setState("happy");
        timeoutRef.current = window.setTimeout(
          () => setState(isConversationActiveRef.current ? "listening" : "idle"),
          TRANSIENT_EXPRESSION_DURATION,
        );
        break;

      case "agentConfused":
        setState("confused");
        timeoutRef.current = window.setTimeout(
          () => setState(isConversationActiveRef.current ? "listening" : "idle"),
          TRANSIENT_EXPRESSION_DURATION,
        );
        break;

      case "conversationEnded":
        setState("goodbye");
        timeoutRef.current = window.setTimeout(goIdle, GOODBYE_DURATION);
        break;

      case "connectionError":
        setState("error");
        break;
    }
  }, [goIdle]);

  // Inactivity watchdog: if nothing happens for INACTIVITY_TIMEOUT while a
  // conversation is active, wind the conversation down gracefully. Never
  // interrupts the agent mid-sentence.
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!isConversationActiveRef.current) return;
      if (state === "speaking" || state === "goodbye" || state === "error") return;
      if (Date.now() - lastActivityRef.current >= INACTIVITY_TIMEOUT) {
        dispatch({ type: "conversationEnded" });
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [state, dispatch]);

  useEffect(() => clearPendingTimeout, []);

  return {
    state,
    dispatch,
    forceState,
    isConversationActive: isConversationActiveRef.current,
  };
}
