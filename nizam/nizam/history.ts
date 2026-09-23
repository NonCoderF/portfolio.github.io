export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export const MAX_HISTORY_MESSAGES = 8;
export const MAX_HISTORY_MESSAGE_CHARS = 1000;

export const sanitizeHistory = (history: unknown): ChatMessage[] => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((message): message is { role: ChatRole; content: string } => {
      if (!message || typeof message !== "object") {
        return false;
      }

      const role = (message as { role?: unknown }).role;
      const content = (message as { content?: unknown }).content;

      return (role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.trim().length > 0;
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_HISTORY_MESSAGE_CHARS),
    }))
    .slice(-MAX_HISTORY_MESSAGES);
};
