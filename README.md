# Cabin

MVP de um personagem conversacional por voz para rodar em tela cheia num Smart
Totem. A própria tela é o "rosto": fundo preto quase absoluto, olhos e boca
desenhados em SVG, reagindo em tempo real ao estado da conversa com um Agent
da ElevenLabs.

Sem robô mecânico, sem backend com banco de dados, sem login — só a tela, o
rosto e a voz.

## 1. Como instalar

Requer Node 20.19+ ou 22.12+ (o SDK da ElevenLabs e as ferramentas do Vite
exigem essa faixa; um Node um pouco mais antigo, ex. 22.11, ainda roda o app
mas pode reclamar em `npm run lint`).

```bash
npm install
```

## 2. Como executar (desenvolvimento)

```bash
npm run dev
```

Abre em `http://localhost:5173`. Para testar num celular/tablet na mesma
rede, use `npm run dev -- --host` e acesse pelo IP da máquina.

## 3. Como criar/configurar o Agent na ElevenLabs

1. Acesse [elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)
   e crie um novo **Agent**.
2. Cole o system prompt sugerido em [`agent-prompt.md`](./agent-prompt.md) no
   campo de prompt do agent (ajuste à vontade).
3. Escolha uma voz e configure o primeiro texto (first message) — ver dicas
   no final do `agent-prompt.md`.
4. Decida se o agent é **Public** ou **Private**:
   - **Public**: qualquer um com o Agent ID consegue conectar direto do
     navegador. É o caminho mais simples — use só `VITE_ELEVENLABS_AGENT_ID`.
   - **Private**: exige autenticação. Você vai precisar do pequeno backend
     descrito na seção 5.

## 4. Onde encontrar o Agent ID

Na página do seu agent em
`elevenlabs.io/app/conversational-ai/agents/<AGENT_ID>`, o ID também aparece
no painel de configuração do agent (campo "Agent ID", ícone de copiar).

## 5. Como configurar o `.env`

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

### Agent público (caminho simples)

```bash
VITE_ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxx
```

Não configure `VITE_SIGNED_URL_ENDPOINT` nesse caso.

### Agent privado (precisa de backend)

A `ELEVENLABS_API_KEY` **nunca** pode aparecer no frontend. Para agents
privados, este projeto inclui uma rota mínima e sem dependências em
[`server/get-signed-url.js`](./server/get-signed-url.js):

```bash
# num terminal separado
ELEVENLABS_API_KEY=xi-xxxxxxxx ELEVENLABS_AGENT_ID=agent_xxxxxxxx npm run server
```

Isso sobe `http://localhost:8787`, que devolve `{ "signedUrl": "..." }`. No
`.env` do frontend, aponte para ela:

```bash
VITE_SIGNED_URL_ENDPOINT=http://localhost:8787
```

Em produção, troque `server/get-signed-url.js` por uma função no seu
backend/serverless existente (Vercel, Cloudflare Workers, AWS Lambda, etc.) —
o handler é pequeno o suficiente para portar em poucos minutos. O contrato é
sempre o mesmo: `GET` sem parâmetros, devolve JSON com `signedUrl` (ou, para
sessões WebRTC, `conversationToken`).

## 6. Como testar o modo debug

Acesse com `?debug=true`, por exemplo:

```
http://localhost:5173/?debug=true
```

Isso abre um painel lateral com:

- `Robot State`, `Connection status`, `Agent speaking`, `Microphone level`,
  `Conversation ID` em tempo real;
- botões para **forçar** qualquer expressão (`idle`, `wake`, `listening`,
  `thinking`, `speaking`, `happy`, `confused`, `goodbye`, `error`) sem
  depender de uma sessão ativa da ElevenLabs — em modo debug a tela inicial
  ("Toque para falar comigo") é pulada e o rosto some direto.

O painel não aparece em produção (só quando a query string tem
`debug=true`).

## 7. Como colocar no tablet

```bash
npm run build
```

Gera a pasta `dist/`. Sirva esses arquivos estáticos com qualquer servidor
HTTP (nginx, `serve -s dist`, um app Android/iOS com WebView, etc.) e abra a
URL no navegador do tablet.

Recomendações para o totem:

- Use HTTPS (ou `localhost`) — permissão de microfone exige contexto seguro.
- Se o tablet ficar sempre ligado na tomada, desative a suspensão de tela nas
  configurações do sistema (o app não gerencia wake lock do SO).
- Trave a orientação do sistema em retrato.

## 8. Como executar em fullscreen/kiosk

- No primeiro toque na tela inicial, o app já chama
  `document.documentElement.requestFullscreen()` automaticamente (melhor
  esforço — alguns navegadores/OS bloqueiam fullscreen fora de um gesto do
  usuário, por isso está atrelado ao toque de início).
- Para um modo kiosk "de verdade" (sem barra de navegador, sem gestos do SO),
  use o navegador em modo kiosk do sistema operacional, por exemplo:

  ```bash
  chrome --kiosk --incognito http://localhost:5173
  ```

- O app já bloqueia: seleção de texto, scroll, menu de contexto, zoom por
  pinça/double-tap, e some com o cursor do mouse depois de alguns segundos
  parado (ver `src/hooks/useKioskMode.ts`).
- Depois de `INACTIVITY_TIMEOUT` (padrão 45s, ver
  `src/config/robotConfig.ts`) sem interação, a conversa é encerrada com a
  expressão `GOODBYE` e a tela volta para o estado inicial, pronta para a
  próxima pessoa. Nunca corta o agente no meio de uma fala.
- Se a conexão cair, o rosto mostra uma expressão discreta de confusão com
  "Um segundo..." embaixo e tenta reconectar sozinho a cada poucos segundos
  — sem stack trace, sem tela técnica.

## 9. Como alterar as cores

Tudo centralizado em [`src/config/robotConfig.ts`](./src/config/robotConfig.ts):

```ts
export const COLORS = {
  background: "#050708",
  primary: "#65F5ED",   // cor dos olhos/boca
  glow: "rgba(101, 245, 237, 0.35)",
  errorText: "rgba(255, 255, 255, 0.45)",
};
```

O fundo também está fixado em `src/index.css` e `src/App.css` — troque nos
três lugares se quiser mudar a paleta de forma consistente.

## 10. Como criar novas expressões

1. Adicione o novo estado em `RobotState` (`src/types/robot.ts`).
2. Descreva a expressão em `EXPRESSIONS` dentro de
   `src/components/RobotFace/expressions.ts` — cada entrada define os
   parâmetros dos dois olhos (`rx`, `ry`, `arcAmount`, `arcDirection`,
   `rotation`, offsets) e da boca (`mouthCurve`, `mouthWidth`, `gazeX/Y`,
   `breathing`). Os componentes `Eyes`/`Mouth` são só SVG "burros" — toda a
   personalidade mora nesse arquivo.
3. Se o estado precisa de uma transição automática (tipo `wake` → `listening`
   sozinho depois de um tempo), adicione a lógica em `useRobotState.ts`.
4. Teste a expressão isoladamente com `?debug=true`, sem precisar de uma
   sessão real da ElevenLabs.

## Arquitetura (visão rápida)

```
RobotFace (visual, SVG)         — não sabe nada de ElevenLabs
   ↑ state, audioLevel
useRobotState (state machine)   — não sabe nada de ElevenLabs
   ↑ dispatch(ConversationEvent)
useElevenLabsAgent              — único lugar que importa @elevenlabs/react
   ↑ status/mode/mensagens do SDK
services/elevenlabs.ts          — resolve agentId / signedUrl / token
```

Trocar de provedor de voz no futuro significa reescrever
`useElevenLabsAgent.ts` e `services/elevenlabs.ts` — `RobotFace` e
`useRobotState` continuam intactos.

## O que ainda depende de configuração manual na ElevenLabs

- Criar o Agent e colar o prompt de `agent-prompt.md`.
- Escolher a voz (TTS) e ajustar velocidade/estabilidade.
- Definir o "first message".
- Marcar o agent como Public (simples) ou Private (exige o backend da seção 5).
- Ajustar os thresholds de detecção de silêncio/turno, se a conversa ficar
  cortando fala ou demorando demais para responder — isso é 100% configuração
  do agent na plataforma ElevenLabs, o frontend só reage aos eventos que o
  SDK entrega.

## Notas de performance

O bundle de produção fica em torno de 870 kB (≈240 kB gzip), dominado pelo
SDK de voz da ElevenLabs (WebRTC/LiveKit). O rosto em si (SVG + CSS) é
praticamente gratuito: sem bibliotecas gráficas pesadas, animações via
`transform`/`opacity`/atributos SVG, e o nível de áudio é lido por
`requestAnimationFrame` com throttle manual em vez de re-renderizar a árvore
inteira a 60fps.
