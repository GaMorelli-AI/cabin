/**
 * All ElevenLabs-specific wiring lives in this file and in
 * `hooks/useElevenLabsAgent.ts`. Nothing outside this pair should import
 * `@elevenlabs/react` or `@elevenlabs/client` directly — that's what keeps
 * RobotFace and the rest of the UI provider-agnostic.
 */

export type ConnectionConfig =
  | { mode: "agentId"; agentId: string }
  | { mode: "signedUrl"; signedUrl: string }
  | { mode: "conversationToken"; conversationToken: string };

export class ElevenLabsConfigError extends Error {}

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;
const SIGNED_URL_ENDPOINT = import.meta.env.VITE_SIGNED_URL_ENDPOINT as string | undefined;

/**
 * Resolves how the browser should open the conversation:
 *  - if VITE_SIGNED_URL_ENDPOINT is set, ask that backend route for a
 *    short-lived signed URL / conversation token (required for private
 *    agents, since minting those needs the ElevenLabs API key, which must
 *    never live in the frontend);
 *  - otherwise connect straight to the public agent via VITE_ELEVENLABS_AGENT_ID.
 */
export async function resolveConnectionConfig(): Promise<ConnectionConfig> {
  if (SIGNED_URL_ENDPOINT) {
    const response = await fetch(SIGNED_URL_ENDPOINT);
    if (!response.ok) {
      throw new ElevenLabsConfigError(`Falha ao obter credenciais de conexão (HTTP ${response.status})`);
    }
    const data = (await response.json()) as { signedUrl?: string; conversationToken?: string };
    if (data.signedUrl) return { mode: "signedUrl", signedUrl: data.signedUrl };
    if (data.conversationToken) return { mode: "conversationToken", conversationToken: data.conversationToken };
    throw new ElevenLabsConfigError("Resposta do endpoint de credenciais não contém signedUrl nem conversationToken");
  }

  if (!AGENT_ID) {
    throw new ElevenLabsConfigError(
      "VITE_ELEVENLABS_AGENT_ID não configurado. Veja .env.example e o README.",
    );
  }

  return { mode: "agentId", agentId: AGENT_ID };
}
