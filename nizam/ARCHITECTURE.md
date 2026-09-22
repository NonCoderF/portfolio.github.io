# Digital Nizam Edge Function

Digital Nizam combines verified personal evidence with general model knowledge and new reasoning. General knowledge may expand what the assistant can explain or solve, but it may not rewrite Nizam's real history.

The GET/POST API remains compatible and returns a natural reply plus optional structured resources:

```json
{
  "reply": "Natural first-person answer",
  "resources": []
}
```

## Request flow

1. Parse the current `prompt` and sanitize separately supplied conversation `history`.
2. Run narrow deterministic fast paths for stable identity and time-sensitive facts.
3. Ask a small semantic router to classify the meaning as `personal`, `general`, or `blended`. It also identifies intent, topics, retrieval queries, knowledge requirements, claim-verification requirements, and whether a resource would genuinely help.
4. If personal memory is needed, retrieve candidate evidence with OpenAI embeddings over the cached local knowledge index. Semantic search terms provide a fallback if embeddings fail.
5. Semantically rerank the candidates. Keep at most three items that materially help, and describe whether each is directly or analogically relevant to the current reasoning. Unrelated background is discarded.
6. Build an evidence-aware prompt:
   - personal answers use verified evidence;
   - general answers use broad model knowledge;
   - blended answers combine verified experience with new reasoning;
   - absent personal evidence is handled after retrieval, not as a router mode.
7. Generate a concise, conversational first-person answer. For blended questions, the relevance mapping appears before the verified evidence so experience shapes the reasoning rather than being appended afterward.
8. For answers capable of making personal historical claims, run a claim-verification pass against the selected evidence. Unsupported claims trigger one repaired generation.
9. Return resource cards only when the semantic router explicitly marks them useful. The browser no longer scans answer text and automatically attaches project cards.

If semantic routing or embeddings fail, the existing local detectors and lexical retrieval remain as operational fallbacks. They are no longer the primary understanding mechanism.

## Identity boundary

- Verified memory supports claims such as "I built", "I used", and "I worked on".
- General model knowledge supports explanations, comparisons, and technical facts.
- New reasoning supports present-day opinions and solutions to problems Nizam has not previously built.
- Related experience does not prove exact experience. A box-detection question may use exercise-recognition experience as grounding, but the answer may not claim Nizam built box detection.

## Main modules

- `retrieval/queryUnderstanding.ts`: semantic routing contract and fallback mapping.
- `retrieval/semanticRetriever.ts`: embedding retrieval with semantic-term fallback.
- `retrieval/evidenceSelector.ts`: semantic reranking and experience-to-problem relevance mapping.
- `knowledge/fileIndex.ts`: cached local evidence index.
- `prompts/promptBuilder.ts`: personal/general/blended evidence boundary.
- `answers/personalClaimVerifier.ts`: post-generation verification of personal claims.
- `resources/resourceResolver.ts`: explicitly gated optional resources.
- `history.ts`: bounded structured conversation history.

## Cost and latency

Stable fast paths make no model call. A normal semantic answer uses routing plus generation, embedding lookup, and—when personal claims are possible—a lightweight verification call. Knowledge embeddings are cached per warm Edge Function isolate; query embeddings are calculated per relevant request.
