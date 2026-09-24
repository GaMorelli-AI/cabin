/**
 * Minimal, dependency-free backend route for PRIVATE ElevenLabs agents.
 *
 * The ElevenLabs API key can never live in the frontend bundle. If your
 * agent is private, run this tiny server (or port this handler into
 * whatever backend/serverless platform you already use) and point
 * VITE_SIGNED_URL_ENDPOINT at it. It reads the real API key from its own
 * environment and hands the browser a short-lived signed URL instead.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=xi-xxxx ELEVENLABS_AGENT_ID=agent_xxxx node server/get-signed-url.js
 *
 * Not needed at all for public agents — VITE_ELEVENLABS_AGENT_ID alone is enough.
 */
import http from "node:http";

const PORT = process.env.PORT || 8787;
const API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

if (!API_KEY || !AGENT_ID) {
  console.error("Defina ELEVENLABS_API_KEY e ELEVENLABS_AGENT_ID antes de iniciar este servidor.");
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "GET" || !req.url?.startsWith("/")) {
    res.writeHead(404);
    res.end();
    return;
  }

  try {
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(AGENT_ID)}`;
    const upstream = await fetch(url, { headers: { "xi-api-key": API_KEY } });

    if (!upstream.ok) {
      res.writeHead(upstream.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `ElevenLabs respondeu ${upstream.status}` }));
      return;
    }

    const data = await upstream.json();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ signedUrl: data.signed_url }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }));
  }
});

server.listen(PORT, () => {
  console.log(`Signed URL endpoint rodando em http://localhost:${PORT}`);
});
