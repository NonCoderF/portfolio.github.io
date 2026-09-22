// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getTemplateAnswer } from "./answers/templateAnswers.ts";
import { getTemporalAnswer } from "./answers/temporalAnswers.ts";
import { personalizeAnswer } from "./answers/personalizeAnswer.ts";
import { buildClaimVerificationMessages, parseClaimVerification } from "./answers/personalClaimVerifier.ts";
import { validatePersonalAnswer } from "./answers/responseValidator.ts";
import { isConcretePersonalFactQuery } from "./answers/answerMode.ts";
import { sanitizeHistory, type ChatMessage } from "./history.ts";
import { identityProfile } from "./knowledge/identityProfile.ts";
import { callOpenAIChat, type OpenAIMessage } from "./openaiClient.ts";
import { buildSystemPrompt } from "./prompts/promptBuilder.ts";
import { resolveRelevantResources, resolveResources } from "./resources/resourceResolver.ts";
import { detectIntent } from "./retrieval/intentDetector.ts";
import { normalizeQuery } from "./retrieval/queryNormalizer.ts";
import { detectQueryScope } from "./retrieval/queryScope.ts";
import { buildFallbackUnderstanding, buildUnderstandingMessages, parseQueryUnderstanding, type QueryUnderstanding } from "./retrieval/queryUnderstanding.ts";
import { retrieveSemanticKnowledge } from "./retrieval/semanticRetriever.ts";
import { selectRelevantEvidence } from "./retrieval/evidenceSelector.ts";
import { resolveTemporalState } from "./temporal/temporalFacts.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type RequestBody = {
  prompt?: string;
  history?: unknown;
};

const jsonResponse = (
  body: Record<string, unknown>,
  status = 200,
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const readRequest = async (req: Request): Promise<{
  prompt?: string;
  history: ChatMessage[];
  historyWasInvalid: boolean;
}> => {
  if (req.method === "GET") {
    return {
      prompt: new URL(req.url).searchParams.get("prompt")?.trim() ?? undefined,
      history: [],
      historyWasInvalid: false,
    };
  }

  const body: RequestBody = await req.json();

  return {
    prompt: typeof body.prompt === "string" ? body.prompt.trim() : undefined,
    history: sanitizeHistory(body.history),
    historyWasInvalid: body.history !== undefined && !Array.isArray(body.history),
  };
};

// @ts-ignore
serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, history, historyWasInvalid } = await readRequest(req);

    if (historyWasInvalid) {
      return jsonResponse({ error: "history must be an array" }, 400);
    }

    if (!prompt) {
      return jsonResponse({ error: "prompt required" }, 400);
    }

    const normalized = normalizeQuery(prompt);
    const directIdentityAnswer = getIndexIdentityAnswer(normalized);

    if (directIdentityAnswer) {
      logDecision({
        normalized,
        scope: "personal",
        intent: "identity",
        subtype: directIdentityAnswer.subtype,
        answerMode: "verified",
        retrievedIds: ["identity.md"],
        resourceIds: directIdentityAnswer.resources.map((resource) => `${resource.type}:${resource.id}`),
        fastPath: true,
        openAICalled: false,
        queryExpanded: false,
        validationRetryUsed: false,
      });

      return jsonResponse({
        reply: directIdentityAnswer.reply,
        resources: directIdentityAnswer.resources,
      });
    }

    const detected = detectIntent(prompt);
    const localScope = detected.intent === "general" ? detectQueryScope(prompt) : "personal";
    const temporalAnswer = getTemporalAnswer(prompt);

    if (temporalAnswer) {
      logDecision({
        normalized,
        scope: localScope,
        intent: detected.intent,
        temporalIntent: resolveTemporalState(prompt).intent,
        subtype: detected.identitySubtype,
        answerMode: "verified",
        retrievedIds: [],
        resourceIds: temporalAnswer.resources.map((resource) => `${resource.type}:${resource.id}`),
        fastPath: true,
        openAICalled: false,
        queryExpanded: false,
        validationRetryUsed: false,
      });

      return jsonResponse(temporalAnswer);
    }

    const templateAnswer = getTemplateAnswer(prompt);

    if (templateAnswer) {
      logDecision({
        normalized,
        scope: localScope,
        intent: detected.intent,
        temporalIntent: resolveTemporalState(prompt).intent,
        subtype: detected.identitySubtype,
        answerMode: "verified",
        retrievedIds: [],
        resourceIds: templateAnswer.resources.map((resource) => `${resource.type}:${resource.id}`),
        fastPath: true,
        openAICalled: false,
        queryExpanded: false,
        validationRetryUsed: false,
      });

      return jsonResponse(templateAnswer);
    }

    let understanding: QueryUnderstanding | null = null;
    if (OPENAI_API_KEY) {
      const understood = await callOpenAIChat(
        OPENAI_API_KEY,
        buildUnderstandingMessages(prompt),
        140,
        0,
      );
      if (understood.ok) understanding = parseQueryUnderstanding(understood.message);
    }
    understanding ??= buildFallbackUnderstanding(localScope, detected.intent);
    const scope = understanding.mode === "general" ? "general" : "personal";
    const retrieval = await retrieveSemanticKnowledge(OPENAI_API_KEY, prompt, understanding);
    const evidence = await selectRelevantEvidence(
      OPENAI_API_KEY,
      prompt,
      understanding,
      retrieval.chunks,
    );
    const chunks = evidence.chunks;
    logTemporalConflictWarnings(chunks);

    const builtPrompt = buildSystemPrompt(prompt, {
      knowledgeChunks: chunks,
      evidenceConnections: evidence.connections,
      understanding,
    });
    const resources = understanding.shouldSurfaceResources
      ? resolveRelevantResources(prompt, understanding.topics, [...builtPrompt.memories, ...chunks])
      : [];

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return jsonResponse({ error: "OpenAI API key is not configured" }, 500);
    }

    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content: builtPrompt.systemPrompt,
      },
      ...history,
      {
        role: "user",
        content: prompt,
      },
    ];

    let validationRetryUsed = false;
    let unsupportedClaims: string[] = [];
    let generated = await callOpenAIChat(OPENAI_API_KEY, messages);

    if (!generated.ok) {
      console.error("OpenAI error status:", generated.status);
      console.error("OpenAI error body:", generated.body);
      console.error("Retrieved ids:", builtPrompt.resumeSections.map((section) => section.id));
      console.error("Estimated prompt size:", builtPrompt.estimatedTokens);
      console.error("History count:", history.length);

      return jsonResponse({
        error: "OpenAI request failed",
        status: generated.status,
      }, 502);
    }

    let message = personalizeAnswer(
      prompt,
      generated.message,
      builtPrompt.scope,
      builtPrompt.resumeSections,
    );
    let validation = validatePersonalAnswer(builtPrompt.scope, message, prompt);

    if (understanding.personalClaimsMustBeVerified) {
      const verificationResult = await callOpenAIChat(
        OPENAI_API_KEY,
        buildClaimVerificationMessages(prompt, message, builtPrompt.resumeSections, chunks),
        160,
        0,
      );
      const verification = verificationResult.ok
        ? parseClaimVerification(verificationResult.message)
        : null;
      if (verification && !verification.supported) {
        unsupportedClaims = verification.unsupportedClaims;
        validation = { ok: false, kind: "personal", reason: "unsupported_personal_claim" };
      }
    }

    if (!validation.ok) {
      validationRetryUsed = true;
      const retryPrompt = buildSystemPrompt(prompt, {
        retry: true,
        temporalRepair: validation.kind === "temporal",
        claimRepair: unsupportedClaims,
        knowledgeChunks: chunks,
        evidenceConnections: evidence.connections,
        understanding,
      });
      const retryMessages: OpenAIMessage[] = [
        {
          role: "system",
          content: retryPrompt.systemPrompt,
        },
        ...history,
        {
          role: "user",
          content: prompt,
        },
      ];

      generated = await callOpenAIChat(OPENAI_API_KEY, retryMessages);

      if (!generated.ok) {
        console.error("OpenAI retry error status:", generated.status);
        console.error("OpenAI retry error body:", generated.body);

        return jsonResponse({
          error: "OpenAI request failed",
          status: generated.status,
        }, 502);
      }

      message = personalizeAnswer(
        prompt,
        generated.message,
        retryPrompt.scope,
        retryPrompt.resumeSections,
      );
      validation = validatePersonalAnswer(retryPrompt.scope, message, prompt);

      if (validation.ok && understanding.personalClaimsMustBeVerified) {
        const verificationResult = await callOpenAIChat(
          OPENAI_API_KEY,
          buildClaimVerificationMessages(prompt, message, retryPrompt.resumeSections, chunks),
          160,
          0,
        );
        const verification = verificationResult.ok
          ? parseClaimVerification(verificationResult.message)
          : null;
        if (verification && !verification.supported) {
          validation = { ok: false, kind: "personal", reason: "unsupported_personal_claim_after_retry" };
        }
      }

      if (!validation.ok && retryPrompt.scope === "personal") {
        message = understanding.intent === "technical_experience" || isConcretePersonalFactQuery(prompt)
          ? "I can't honestly claim that specific experience from what I've verified about my work. I can still explain how I'd approach it using the engineering experience I do have."
          : "My practical take is to break the problem down, validate the risky assumptions early, and let real feedback guide the next decision.";
      }
    }

    logDecision({
      normalized,
      scope: builtPrompt.scope,
      intent: builtPrompt.intent,
      temporalIntent: resolveTemporalState(prompt).intent,
      subtype: builtPrompt.subtype,
      answerMode: builtPrompt.answerMode,
      retrievedIds: [
        ...builtPrompt.resumeSections.map((section) => section.id),
        ...chunks.map((chunk) => chunk.id),
      ],
      resourceIds: resources.map((resource) => `${resource.type}:${resource.id}`),
      fastPath: false,
      openAICalled: true,
      queryExpanded: retrieval.strategy === "embedding",
      validationRetryUsed,
    });

    return jsonResponse({
      reply: message,
      resources,
    });
  } catch (err) {
    console.error("Edge function error:", err);

    return jsonResponse({
      error: "Internal server error",
      details: err instanceof Error ? err.message : String(err),
    }, 500);
  }
});

type DecisionLog = {
  normalized: string;
  scope: string;
  intent: string;
  temporalIntent?: string;
  subtype?: string;
  answerMode: string;
  retrievedIds: string[];
  resourceIds: string[];
  fastPath: boolean;
  openAICalled: boolean;
  queryExpanded: boolean;
  validationRetryUsed: boolean;
};

const getIndexIdentityAnswer = (
  normalizedQuery: string,
): { reply: string; resources: Array<{ type: "identity"; id: string; title?: string; subtitle?: string }>; subtype: string } | null => {
  if (/^where were you born$/.test(normalizedQuery)) {
    const birthplace = identityProfile.birthplace?.trim();

    if (!birthplace) {
      return {
        reply: "I haven't added my verified birthplace to the information available to this assistant, so I don't want to invent it.",
        resources: [],
        subtype: "birthplace",
      };
    }

    return {
      reply: `I was born in ${birthplace}.`,
      resources: [
        {
          type: "identity",
          id: "birthplace",
          title: "Birthplace",
          subtitle: birthplace,
        },
      ],
      subtype: "birthplace",
    };
  }

  return null;
};

const logDecision = (decision: DecisionLog): void => {
  console.log("Normalized query:", decision.normalized);
  console.log("Scope:", decision.scope);
  console.log("Intent:", decision.intent);
  console.log("Temporal intent:", decision.temporalIntent ?? "");
  console.log("Subtype:", decision.subtype ?? "");
  console.log("Answer mode:", decision.answerMode);
  console.log("Retrieved ids:", decision.retrievedIds);
  console.log("Resource ids:", decision.resourceIds);
  console.log("Fast path used:", decision.fastPath);
  console.log("OpenAI called:", decision.openAICalled);
  console.log("Query expansion used:", decision.queryExpanded);
  console.log("Validation retry used:", decision.validationRetryUsed);
};

const logTemporalConflictWarnings = (chunks: Array<{ content: string; id: string; source: string }>): void => {
  if (Deno.env.get("ENVIRONMENT") !== "development" && Deno.env.get("DENO_ENV") !== "development") {
    return;
  }

  const staleCurrentEmployer = chunks.find((chunk) =>
    /currently (working|work|employed).*vantage circle|current (role|employer|company).*vantage circle/i.test(chunk.content)
  );

  if (staleCurrentEmployer) {
    console.warn(
      "Temporal conflict warning: stale current-employment wording found in retrieved source",
      staleCurrentEmployer.source,
      staleCurrentEmployer.id,
    );
  }
};
