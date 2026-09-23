import type { ChatMessage } from "./history.ts";

export type OpenAIMessage = ChatMessage | {
  role: "system";
  content: string;
};

export type OpenAIResult =
  | { ok: true; message: string }
  | { ok: false; status: number; body: string };

export type LlmCallMetric = { purpose: string; model: string; inputChars: number; maxOutputTokens: number; inputTokens?: number; outputTokens?: number; startedAt?: number; endedAt?: number; durationMs?: number; status?: number | string };
export type RemoteCallMetrics = {
  llmCalls?: LlmCallMetric[];
  embeddingCalls?: unknown[];
  purpose?: string;
};

export const callOpenAIChat = async (
  apiKey: string,
  messages: OpenAIMessage[],
  maxTokens = 600,
  temperature = 0.7,
  metrics?: RemoteCallMetrics,
): Promise<OpenAIResult> => {
  const call: LlmCallMetric = {
    purpose: metrics?.purpose ?? "chat",
    model: "gpt-4o-mini",
    inputChars: messages.reduce((sum, message) => sum + message.content.length, 0),
    maxOutputTokens: maxTokens,
    startedAt: performance.now(),
  };
  metrics?.llmCalls?.push(call);
  const openAIResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    },
  );

  call.endedAt = performance.now();
  call.durationMs = Math.round((call.endedAt - call.startedAt!) * 100) / 100;
  call.status = openAIResponse.status;
  if (!openAIResponse.ok) {
    return {
      ok: false,
      status: openAIResponse.status,
      body: await openAIResponse.text(),
    };
  }

  const data = await openAIResponse.json();
  call.inputTokens = typeof data?.usage?.prompt_tokens === "number" ? data.usage.prompt_tokens : undefined;
  call.outputTokens = typeof data?.usage?.completion_tokens === "number" ? data.usage.completion_tokens : undefined;

  return {
    ok: true,
    message: data?.choices?.[0]?.message?.content?.trim() ?? "Server ka problem hai!",
  };
};

/** Stream plain text deltas from the OpenAI SSE response for safe, non-personal answers. */
export const streamOpenAIChat = async (
  apiKey: string,
  messages: OpenAIMessage[],
  metrics?: RemoteCallMetrics,
): Promise<Response> => {
  const call: LlmCallMetric = {
    purpose: metrics?.purpose ?? "stream_generation",
    model: "gpt-4o-mini",
    inputChars: messages.reduce((sum, message) => sum + message.content.length, 0),
    maxOutputTokens: 600,
    startedAt: performance.now(),
  };
  metrics?.llmCalls?.push(call);
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 600,
      temperature: 0.7,
      stream: true,
    }),
    },
  );
  call.endedAt = performance.now();
  call.durationMs = Math.round((call.endedAt - call.startedAt!) * 100) / 100;
  call.status = response.status;
  return response;
};
