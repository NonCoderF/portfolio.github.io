import type { ChatMessage } from "./history.ts";

export type OpenAIMessage = ChatMessage | {
  role: "system";
  content: string;
};

export type OpenAIResult =
  | { ok: true; message: string }
  | { ok: false; status: number; body: string };

export type OpenAIEmbeddingResult =
  | { ok: true; embeddings: number[][] }
  | { ok: false; status: number; body: string };

export const callOpenAIChat = async (
  apiKey: string,
  messages: OpenAIMessage[],
  maxTokens = 180,
  temperature = 0.7,
): Promise<OpenAIResult> => {
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

  if (!openAIResponse.ok) {
    return {
      ok: false,
      status: openAIResponse.status,
      body: await openAIResponse.text(),
    };
  }

  const data = await openAIResponse.json();

  return {
    ok: true,
    message: data?.choices?.[0]?.message?.content?.trim() ?? "Server ka problem hai!",
  };
};

export const callOpenAIEmbeddings = async (
  apiKey: string,
  inputs: string[],
): Promise<OpenAIEmbeddingResult> => {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: inputs,
      dimensions: 512,
    }),
  });

  if (!response.ok) {
    return { ok: false, status: response.status, body: await response.text() };
  }

  const data = await response.json();
  const embeddings = Array.isArray(data?.data)
    ? data.data.sort((a: { index: number }, b: { index: number }) => a.index - b.index)
      .map((item: { embedding?: unknown }) => item.embedding)
      .filter((embedding: unknown): embedding is number[] =>
        Array.isArray(embedding) && embedding.every((value) => typeof value === "number"))
    : [];

  return embeddings.length === inputs.length
    ? { ok: true, embeddings }
    : { ok: false, status: 502, body: "Embedding response was incomplete" };
};
