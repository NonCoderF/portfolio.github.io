import { calculateAge } from "./retrieval/age.ts";
import { getIdentityFastPath } from "./retrieval/identityFastPath.ts";
import { getBiographyFastPath } from "./retrieval/biographyFastPath.ts";
import { memoryRetriever } from "./retrieval/memoryRetriever.ts";
import { normalizeCanonicalQuery, normalizeQuery } from "./retrieval/queryNormalizer.ts";
import { buildSystemPrompt } from "./prompts/promptBuilder.ts";
import { sanitizeHistory } from "./history.ts";
import { DOB } from "./knowledge/memories.ts";
import { resolveRelevantResources, resolveResources, selectEvidenceBackedResources } from "./resources/resourceResolver.ts";
import { detectIntent } from "./retrieval/intentDetector.ts";
import { retrieveResumeSections } from "./resume/resumeRetriever.ts";
import { detectQueryScope } from "./retrieval/queryScope.ts";
import { chooseAnswerMode } from "./answers/answerMode.ts";
import { validatePersonalAnswer } from "./answers/responseValidator.ts";
import { getTemplateAnswer } from "./answers/templateAnswers.ts";
import { getTemporalAnswer } from "./answers/temporalAnswers.ts";
import { getKnowledgeDiagnostics, retrieveKnowledgeChunks } from "./knowledge/fileIndex.ts";
import { NIZAM_KNOWLEDGE } from "./knowledge/index.ts";
import { parseQueryExpansion } from "./retrieval/queryExpansion.ts";
import { parseQueryUnderstanding, type QueryUnderstanding } from "./retrieval/queryUnderstanding.ts";
import { cosineSimilarity, retrieveSemanticKnowledge } from "./retrieval/semanticRetriever.ts";
import { parseEvidenceSelection } from "./retrieval/evidenceSelector.ts";
import { parseClaimVerification } from "./answers/personalClaimVerifier.ts";
import {
  detectTemporalIntent,
  findLatestFormerEmployment,
  formatDisplayDate,
  resolveCurrentEmployment,
  resolveTemporalState,
  TEMPORAL_FACTS,
} from "./temporal/temporalFacts.ts";

const assert = (condition: unknown, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertEquals = <T>(actual: T, expected: T, message?: string): void => {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${String(expected)}, received ${String(actual)}`);
  }
};

const testUnderstanding = (
  overrides: Partial<QueryUnderstanding> & Pick<QueryUnderstanding, "mode" | "intent">,
): QueryUnderstanding => ({
  mode: overrides.mode,
  intent: overrides.intent,
  topics: overrides.topics ?? [],
  retrievalQueries: overrides.retrievalQueries ?? [],
  needsPersonalMemory: overrides.needsPersonalMemory ?? overrides.mode !== "general",
  needsGeneralKnowledge: overrides.needsGeneralKnowledge ?? overrides.mode !== "personal",
  personalClaimsMustBeVerified: overrides.personalClaimsMustBeVerified ?? overrides.mode !== "general",
  shouldSurfaceResources: overrides.shouldSurfaceResources ?? false,
  confidence: overrides.confidence ?? 0.95,
});

const idsFor = (query: string): string[] =>
  memoryRetriever.retrieve(query).map((memory) => memory.id);

const resumeIdsFor = (query: string): string[] =>
  retrieveResumeSections(query).map((section) => section.id);

Deno.test("deployment artifact contains verified knowledge across core domains", () => {
  assert(NIZAM_KNOWLEDGE.length >= 25, "production knowledge collection is unexpectedly small");
  assert(NIZAM_KNOWLEDGE.every((record) => record.verified), "collection contains unverified records");
  assertEquals(new Set(NIZAM_KNOWLEDGE.map((record) => record.id)).size, NIZAM_KNOWLEDGE.length);

  const byId = new Map(NIZAM_KNOWLEDGE.map((record) => [record.id, record]));
  const exercise = byId.get("projects-2")?.content.toLowerCase() ?? "";
  for (const concept of ["pose", "smooth", "tensorflow lite", "posture", "orientation", "false positives", "liveness"]) {
    assert(exercise.includes(concept), `exercise-recognition record is missing ${concept}`);
  }

  assert(byId.get("projects-3")?.content.includes("ArchGuard"), "Android architecture memory is missing");
  assert(byId.get("projects-4")?.content.includes("TCP networking"), "networking memory is missing");
  assert(byId.get("experience-4")?.content.includes("Jetpack Compose"), "Compose experience is missing");
  assert(byId.get("experience-4")?.content.includes("MVP to MVVM"), "architecture migration experience is missing");
  assert(byId.get("skills-1")?.content.includes("API integration"), "integration skills memory is missing");

  const diagnostics = getKnowledgeDiagnostics();
  assertEquals(diagnostics.source, "TYPESCRIPT_STATIC_IMPORT");
  assertEquals(diagnostics.recordCount, NIZAM_KNOWLEDGE.length);
  assert(Object.values(diagnostics.coreRecords).every((status) => status === "FOUND"), "runtime core record diagnostics failed");
});

Deno.test("normalizes spelling, aliases, punctuation, and grammar variations", () => {
  assertEquals(normalizeCanonicalQuery("When did you born?"), "when were you born");
  assertEquals(normalizeCanonicalQuery("When did you borned?"), "when were you born");
  assertEquals(normalizeCanonicalQuery("When you born?"), "when were you born");
  assertEquals(normalizeCanonicalQuery("Where did yoy born?"), "where were you born");
  assertEquals(normalizeCanonicalQuery("What is ur DOB?"), "what is your date of birth");
  assertEquals(normalizeCanonicalQuery("bday"), "birthday");
  assertEquals(normalizeCanonicalQuery("where you born"), "where were you born");
  assertEquals(normalizeCanonicalQuery("where u born"), "where were you born");
  assertEquals(normalizeCanonicalQuery("where are you born"), "where were you born");
  assertEquals(normalizeCanonicalQuery("Where you from"), "where are you from");
  assertEquals(normalizeCanonicalQuery("Where u from"), "where are you from");
  assertEquals(normalizeCanonicalQuery("birth place"), "birthplace");
  assertEquals(normalizeCanonicalQuery("Where did u learn coding"), "where did you learn coding");
  assertEquals(normalizeCanonicalQuery("android dev"), "android developer");
  assertEquals(normalizeCanonicalQuery("your fav project"), "your favorite project");
  assert(normalizeQuery("Do you know KMM?").includes("kotlin multiplatform"), "KMM alias was not expanded");
});

Deno.test("identity fast path returns deterministic DOB and age answers", () => {
  assertEquals(
    getIdentityFastPath("When were you born?")?.reply,
    "I was born on 11 April 1993.",
  );
  assertEquals(
    getIdentityFastPath("When did you born?")?.reply,
    "I was born on 11 April 1993.",
  );
  assertEquals(
    getIdentityFastPath("What is your birthday?")?.reply,
    "My birthday is on 11 April.",
  );
  assertEquals(
    getIdentityFastPath("DOB?")?.reply,
    "I was born on 11 April 1993.",
  );
  assertEquals(
    getIdentityFastPath("YOUR AGE", new Date(Date.UTC(2026, 6, 25)))?.reply,
    "I'm 33 years old.",
  );
  assertEquals(
    getIdentityFastPath("How old are you?", new Date(Date.UTC(2026, 6, 25)))?.reply,
    "I'm 33 years old.",
  );
  assertEquals(
    getIdentityFastPath("Where are you from?")?.reply,
    "I'm from Mukalmua, Assam, India.",
  );
  assertEquals(
    getIdentityFastPath("Where you from")?.reply,
    "I'm from Mukalmua, Assam, India.",
  );
  assertEquals(
    getTemplateAnswer("Where you from")?.reply,
    "I'm from Mukalmua, Assam, India.",
  );
  assertEquals(
    getIdentityFastPath("where you born")?.reply,
    "I was born in Mukalmua, Assam, India.",
  );
  assertEquals(
    getIdentityFastPath("where did yoy born")?.reply,
    "I was born in Mukalmua, Assam, India.",
  );
  assertEquals(
    getIdentityFastPath("where you born", new Date(), {
      fullName: "Nizamuddin Ali Ahmed",
      preferredName: "Nizam",
      dateOfBirth: "1993-04-11",
      birthdayDisplay: "11 April 1993",
      birthDay: 11,
      birthMonth: 4,
      birthYear: 1993,
      professionalHeadline: "Senior Android Engineer",
      yearsOfExperience: "6+ years",
      birthplace: "Verified Birthplace",
      hometown: "Mukalmua, Assam, India",
    })?.reply,
    "I was born in Verified Birthplace.",
  );
  assertEquals(
    getIdentityFastPath("where you born", new Date(), {
      fullName: "Nizamuddin Ali Ahmed",
      preferredName: "Nizam",
      dateOfBirth: "1993-04-11",
      birthdayDisplay: "11 April 1993",
      birthDay: 11,
      birthMonth: 4,
      birthYear: 1993,
      professionalHeadline: "Senior Android Engineer",
      yearsOfExperience: "6+ years",
      birthplace: undefined,
      hometown: "Mukalmua, Assam, India",
    })?.reply,
    "I haven't added my verified birthplace to the information available to this assistant, so I don't want to invent it.",
  );
  assertEquals(
    getIdentityFastPath("What did you study?")?.reply,
    "I completed a Bachelor of Engineering in Mechanical Engineering from the Royal School of Engineering and Technology between 2013 and 2017. Although my degree is in Mechanical Engineering, I later taught myself Java, Data Structures, Algorithms, and Kotlin before moving into Android engineering. I have more than six years of Android engineering experience.",
  );
  assertEquals(resolveResources("What did you study?", [], true)[0]?.id, "mechanical-engineering");
});

Deno.test("dynamic age changes before and after 11 April", () => {
  assertEquals(calculateAge(DOB, new Date(Date.UTC(2026, 3, 10))), 32);
  assertEquals(calculateAge(DOB, new Date(Date.UTC(2026, 3, 11))), 33);
});

Deno.test("retrieves the smallest useful memory set", () => {
  assertEquals(idsFor("When were you born?").join(","), "identity-dob");
  assertEquals(detectIntent("where you born").intent, "identity");
  assertEquals(detectIntent("where you born").identitySubtype, "birthplace");
  assertEquals(detectIntent("where did yoy born").identitySubtype, "birthplace");
  assertEquals(idsFor("where you born").join(","), "identity-birthplace");
  assertEquals(idsFor("where did yoy born").join(","), "identity-birthplace");
  assertEquals(idsFor("Where were you born?").join(","), "identity-birthplace");
  assertEquals(idsFor("where u born").join(","), "identity-birthplace");
  assertEquals(idsFor("What is your birthplace?").join(","), "identity-birthplace");
  assertEquals(idsFor("Where are you from?").join(","), "identity-hometown");
  assertEquals(detectIntent("Where you from").intent, "identity");
  assertEquals(detectIntent("Where you from").identitySubtype, "hometown");
  assertEquals(idsFor("Where you from").join(","), "identity-hometown");
  assertEquals(idsFor("Where u from").join(","), "identity-hometown");
  assertEquals(idsFor("What your qualification").join(","), "education-mechanical-engineering");
  assertEquals(idsFor("Qualification").join(","), "education-mechanical-engineering");
  assertEquals(idsFor("Degree").join(","), "education-mechanical-engineering");
  assertEquals(idsFor("Education").join(","), "education-mechanical-engineering");
  assertEquals(idsFor("Academic background").join(","), "education-mechanical-engineering");
  assertEquals(idsFor("Which college did you attend?").join(","), "education-mechanical-engineering");
  assertEquals(idsFor("Highest qualification?").join(","), "education-mechanical-engineering");
  assertEquals(idsFor("Where did you learn coding?").join(","), "biography-career-transition");
  assertEquals(idsFor("How did you learn programming?").join(","), "biography-career-transition");
  assertEquals(idsFor("Are you self-taught?").join(","), "biography-career-transition");
  assertEquals(idsFor("How did you become an Android developer?").join(","), "biography-career-transition");
  assertEquals(idsFor("Where did u learn coding").join(","), "biography-career-transition");
  assertEquals(idsFor("Who taught you coding?").join(","), "biography-career-transition");
  assertEquals(idsFor("your age").join(","), "identity-dob");
  assertEquals(idsFor("Tell me about ArchGuard").join(","), "project-archguard");
  assertEquals(idsFor("Tell me about Orhan").join(","), "project-orhan");
  assertEquals(idsFor("What did you do at Vantage Circle?").join(","), "experience-vantage-circle");
  assertEquals(
    idsFor("Tell me about yourself").join(","),
    "identity-summary,biography-origin,career-summary",
  );
  assert(idsFor("Tell me about yourself").length <= 3, "retriever returned more than three memories");
});

Deno.test("does not inject portfolio knowledge for general technical questions", () => {
  assertEquals(idsFor("What is MVVM?").length, 0);
  assertEquals(idsFor("How do I collect StateFlow from a ViewModel?").length, 0);
  assertEquals(idsFor("Write a Kotlin coroutine example").length, 0);
  assertEquals(detectIntent("How can I learn coding?").intent, "general");
  assertEquals(idsFor("How can I learn coding?").length, 0);
});

Deno.test("detects biography coding journey intent and fast path", () => {
  assertEquals(detectIntent("Where did you learn coding?").intent, "biography");
  assertEquals(detectIntent("How did you learn programming?").intent, "biography");
  assertEquals(detectIntent("Are you self-taught?").intent, "biography");
  assertEquals(detectIntent("How did you become an Android developer?").intent, "biography");
  assertEquals(detectIntent("Where did u learn coding").intent, "biography");
  assertEquals(detectIntent("Who taught you coding?").intent, "biography");

  const reply = getBiographyFastPath("Where did you learn coding?")?.reply ?? "";

  assert(reply.includes("self-taught"), "fast path does not state self-taught");
  assert(reply.includes("Mechanical Engineering"), "fast path omits Mechanical Engineering");
  assert(reply.includes("Java"), "fast path omits Java");
  assert(reply.includes("Data Structures"), "fast path omits Data Structures");
  assert(reply.includes("Algorithms"), "fast path omits Algorithms");
  assert(reply.includes("Kotlin"), "fast path omits Kotlin");
  assert(!reply.includes("course"), "fast path should not recommend courses");
});

Deno.test("resolves structured resource cards from memories", () => {
  assertEquals(
    resolveResources("Tell me about ArchGuard", memoryRetriever.retrieve("Tell me about ArchGuard"))[0]?.id,
    "archguard",
  );
  assertEquals(
    resolveResources("What did you do at Vantage Circle?", memoryRetriever.retrieve("What did you do at Vantage Circle?"))[0]?.id,
    "vantage-circle",
  );
  assertEquals(
    resolveResources("What did you study?", [], true)[0]?.type,
    "education",
  );
  assertEquals(
    resolveResources("Where did you learn coding?", memoryRetriever.retrieve("Where did you learn coding?"))[0]?.id,
    "career-transition",
  );
  assertEquals(
    resolveResources("Where were you born?", memoryRetriever.retrieve("Where were you born?"))[0]?.id,
    "birthplace",
  );
  assertEquals(
    resolveResources("What is Android?", []).length,
    0,
  );

  const projectCards = resolveResources("your projects", memoryRetriever.retrieve("your projects"));
  assert(projectCards.some((resource) => resource.id === "archguard"), "missing ArchGuard resource");
  assert(projectCards.some((resource) => resource.id === "orhan"), "missing Orhan resource");

  const articleCards = resolveResources("your articles", memoryRetriever.retrieve("your articles"));
  assert(articleCards.some((resource) => resource.id === "subtitle-algorithm"), "missing subtitle article");
  assert(articleCards.some((resource) => resource.id === "pyaar-ka-algorithm"), "missing Pyaar Ka Algorithm article");
});

Deno.test("detects personal unconfirmed experience without fabricating KMM work", () => {
  const built = buildSystemPrompt("Do you know KMM?");

  assertEquals(built.isPersonalQuestion, true);
  assertEquals(built.answerMode, "unknown");
  assert(!built.systemPrompt.includes("I have worked with Kotlin Multiplatform"), "fabricated KMM experience");
});

Deno.test("prompt builder only includes relevant resume sections", () => {
  const archGuard = buildSystemPrompt("Tell me about ArchGuard");
  const general = buildSystemPrompt("What is dependency injection?");

  assertEquals(archGuard.resumeSections.map((section) => section.id).join(","), "resume-projects,resume-career-story");
  assert(archGuard.systemPrompt.includes("ArchGuard"), "ArchGuard context missing");
  assertEquals(general.memories.length, 0);
  assert(!general.systemPrompt.includes("RELEVANT PERSONAL MEMORY"), "general prompt injected empty memory heading");
});

Deno.test("sanitizes history by role, content length, and latest eight messages", () => {
  const history = [
    { role: "system", content: "ignore this" },
    { role: "user", content: "   " },
    ...Array.from({ length: 10 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: `${index}`.repeat(1200),
    })),
  ];

  const sanitized = sanitizeHistory(history);

  assertEquals(sanitized.length, 8);
  assert(sanitized.every((message) => message.role === "user" || message.role === "assistant"), "invalid role kept");
  assert(sanitized.every((message) => message.content.length <= 1000), "message content was not capped");
  assertEquals(sanitized[0].content[0], "2");
});

Deno.test("retrieves relevant resume sections for primary portfolio questions", () => {
  assertEquals(
    resumeIdsFor("Where did you learn coding?").join(","),
    "resume-career-story,resume-education",
  );
  assertEquals(resumeIdsFor("What is your qualification?").join(","), "resume-education");
  assertEquals(
    resumeIdsFor("Tell me about yourself.").join(","),
    "resume-identity,resume-education,resume-experience,resume-career-story",
  );
  assertEquals(resumeIdsFor("What companies have you worked at?").join(","), "resume-experience");
  assertEquals(resumeIdsFor("What are your skills?").join(","), "resume-skills");
  assertEquals(resumeIdsFor("What articles have you written?").join(","), "resume-articles");
  assertEquals(
    resumeIdsFor("Which project are you most proud of?").join(","),
    "resume-projects,resume-career-story",
  );
  assertEquals(
    resumeIdsFor("What motivates you?").join(","),
    "resume-mission,resume-career-story,resume-projects,resume-education",
  );
  assertEquals(
    resumeIdsFor("What is your mission?").join(","),
    "resume-mission,resume-career-story,resume-projects,resume-education",
  );
  assertEquals(resumeIdsFor("How can I learn coding?").length, 0);
});

Deno.test("classifies scope, intent, answer mode, and templates for replica behavior", () => {
  const personalCases = [
    ["What is your qualification?", "education"],
    ["Where did you learn coding?", "biography"],
    ["Where were you born?", "identity"],
    ["Where are you from?", "identity"],
    ["What is your favorite project?", "projects"],
    ["What kind of engineer are you?", "engineering_opinion"],
    ["Why do you like Kotlin?", "engineering_opinion"],
    ["Why Android?", "engineering_opinion"],
    ["Why did you build ArchGuard?", "projects"],
    ["What motivates you?", "motivation"],
    ["What would you do if your project failed?", "hypothetical"],
    ["How did you learn coding?", "biography"],
  ] as const;

  for (const [query, intent] of personalCases) {
    const detected = detectIntent(query);
    const sections = retrieveResumeSections(query);

    assertEquals(detected.intent, intent);
    assertEquals(detectQueryScope(query), "personal");
    assert(sections.length > 0, `${query} did not retrieve grounded context`);
    assert(chooseAnswerMode("personal", detected, sections) !== "unknown", `${query} chose unknown mode`);
  }

  assertEquals(detectIntent("How can I learn coding?").intent, "general");
  assertEquals(detectQueryScope("How can I learn coding?"), "general");
  assertEquals(retrieveResumeSections("How can I learn coding?").length, 0);

  const qualification = getTemplateAnswer("what your qualification");
  assert(qualification?.reply.includes("Bachelor of Engineering in Mechanical Engineering"), "qualification template missing degree");

  const codingJourney = getTemplateAnswer("where did u learn coding");
  assert(codingJourney?.reply.includes("self-taught"), "coding journey template missing self-taught");

  const favoriteProject = getTemplateAnswer("what is your favorite project");
  assert(favoriteProject?.reply.includes("ArchGuard"), "favorite project template missing ArchGuard");
  assertEquals(favoriteProject?.resources[0]?.id, "archguard");

  const engineeringIdentity = getTemplateAnswer("what kind of engineer are you");
  assert(engineeringIdentity?.reply.includes("Android engineer"), "engineering identity template missing Android engineer");
});

Deno.test("rejects generic personal fallback wording", () => {
  const invalid = validatePersonalAnswer(
    "personal",
    "I don't have a specific experience to share, but many people often learn through online courses.",
  );

  assertEquals(invalid.ok, false);
  assertEquals(validatePersonalAnswer("general", "Many people often learn through online courses.").ok, true);
});

Deno.test("answers technical opinion questions through professional judgment mode", () => {
  const query = "What do you think about on-device OCR?";
  const detected = detectIntent(query);
  const built = buildSystemPrompt(query);

  assertEquals(detected.intent, "engineering_opinion");
  assertEquals(built.scope, "personal");
  assertEquals(built.answerMode, "persona_reasoning");
  assert(
    built.systemPrompt.includes("PROFESSIONAL JUDGMENT MODE"),
    "technical opinion prompt did not enable professional judgment",
  );
  assertEquals(
    validatePersonalAnswer(
      "personal",
      "I haven't shared my specific thoughts on on-device OCR. However, it can be useful.",
      query,
    ).ok,
    false,
  );
});

Deno.test("parses semantic query understanding for personal, general, and blended modes", () => {
  const personal = parseQueryUnderstanding('{"mode":"personal","intent":"technical_experience","topics":["TensorFlow Lite","exercise recognition"],"retrieval_queries":["on-device exercise ML"],"needs_personal_memory":true,"needs_general_knowledge":false,"personal_claims_must_be_verified":true,"should_surface_resources":false,"confidence":0.94}');
  const blended = parseQueryUnderstanding('{"mode":"blended","intent":"opinion","topics":["on-device OCR"],"retrieval_queries":["Android camera ML experience"],"needs_personal_memory":true,"needs_general_knowledge":true,"personal_claims_must_be_verified":true,"should_surface_resources":false,"confidence":0.91}');
  const general = parseQueryUnderstanding('{"mode":"general","intent":"general_question","topics":["quantum computing"],"retrieval_queries":[],"needs_personal_memory":false,"needs_general_knowledge":true,"personal_claims_must_be_verified":false,"should_surface_resources":false,"confidence":0.98}');

  assertEquals(personal?.intent, "technical_experience");
  assertEquals(personal?.personalClaimsMustBeVerified, true);
  assertEquals(blended?.mode, "blended");
  assertEquals(general?.mode, "general");
});

Deno.test("semantic mode invariants prevent blended requests from skipping personal retrieval", () => {
  const parsed = parseQueryUnderstanding(JSON.stringify({
    mode: "blended",
    intent: "solution_design",
    topics: ["on-device ML"],
    retrieval_queries: ["related mobile computer vision experience"],
    needs_personal_memory: false,
    needs_general_knowledge: true,
    personal_claims_must_be_verified: false,
    should_surface_resources: false,
    confidence: 0.8,
  }));
  assert(parsed, "blended router output did not parse");
  assertEquals(parsed!.needsPersonalMemory, true);
  assertEquals(parsed!.needsGeneralKnowledge, true);
  assertEquals(parsed!.personalClaimsMustBeVerified, true);
});

Deno.test("solution design and advice get a retrieval opportunity while definitions remain general", () => {
  const design = parseQueryUnderstanding(JSON.stringify({
    mode: "general", intent: "solution_design", topics: ["movement analysis"], retrieval_queries: [],
    needs_personal_memory: false, needs_general_knowledge: true,
    personal_claims_must_be_verified: false, should_surface_resources: false, confidence: 0.8,
  }));
  assertEquals(design?.mode, "blended");
  assertEquals(design?.needsPersonalMemory, true);

  const definition = parseQueryUnderstanding(JSON.stringify({
    mode: "general", intent: "general_question", topics: ["object detection"], retrieval_queries: [],
    needs_personal_memory: false, needs_general_knowledge: true,
    personal_claims_must_be_verified: false, should_surface_resources: false, confidence: 0.9,
  }));
  assertEquals(definition?.mode, "general");
  assertEquals(definition?.needsPersonalMemory, false);
});

Deno.test("semantic retrieval maps varied mobile ML phrasing to the same verified experience", async () => {
  const cases = [
    ["Did you use TensorFlow Lite before?", ["TensorFlow Lite", "exercise recognition"]],
    ["Have you deployed ML on Android?", ["Android", "on-device ML", "TensorFlow Lite"]],
    ["What ML projects have you worked on?", ["mobile machine learning", "exercise classification", "pose detection"]],
    ["Any on-device ML experience?", ["on-device inference", "TensorFlow Lite", "Android"]],
  ] as const;

  for (const [query, topics] of cases) {
    const understanding = testUnderstanding({
      mode: "personal",
      intent: "technical_experience",
      topics: [...topics],
      retrievalQueries: ["TensorFlow Lite exercise recognition on Android"],
      needsPersonalMemory: true,
      needsGeneralKnowledge: false,
      personalClaimsMustBeVerified: true,
    });
    const result = await retrieveSemanticKnowledge(undefined, query, understanding);
    assert(
      result.chunks.some((chunk) => /tensorflow lite|exercise recognition|squat detection/i.test(chunk.content)),
      `${query} did not retrieve verified mobile ML evidence`,
    );
  }
});

Deno.test("evaluation modes keep general, blended, and unverified experience distinct", async () => {
  const cases: Array<[string, QueryUnderstanding, number]> = [
    ["What is object detection?", testUnderstanding({ mode: "general", intent: "general_question", needsPersonalMemory: false, needsGeneralKnowledge: true }), 0],
    ["What do you think about detecting boxes using a camera?", testUnderstanding({ mode: "blended", intent: "opinion", topics: ["object detection", "camera", "on-device ML"], retrievalQueries: ["camera pose detection TensorFlow Lite experience"], needsPersonalMemory: true, needsGeneralKnowledge: true }), 1],
    ["How would you build real-time box detection on Android?", testUnderstanding({ mode: "blended", intent: "advice", topics: ["real-time object detection", "Android", "TensorFlow Lite"], retrievalQueries: ["on-device camera inference Android"], needsPersonalMemory: true, needsGeneralKnowledge: true }), 1],
    ["Have you personally built box detection?", testUnderstanding({ mode: "personal", intent: "technical_experience", topics: ["box detection", "object detection"], retrievalQueries: ["personally built box object detection"], needsPersonalMemory: true, needsGeneralKnowledge: false, personalClaimsMustBeVerified: true }), 0],
    ["Do you think YOLO or a custom classifier would be better for detecting boxes?", testUnderstanding({ mode: "blended", intent: "opinion", topics: ["YOLO", "custom classifier", "box detection"], retrievalQueries: ["computer vision mobile inference experience"], needsPersonalMemory: true, needsGeneralKnowledge: true }), 1],
    ["What would you build if you had to detect punches with a phone camera?", testUnderstanding({ mode: "blended", intent: "advice", topics: ["punch detection", "pose detection", "temporal classification"], retrievalQueries: ["pose exercise recognition movement sequences"], needsPersonalMemory: true, needsGeneralKnowledge: true }), 1],
    ["Have you worked with BLE?", testUnderstanding({ mode: "personal", intent: "technical_experience", topics: ["Bluetooth Low Energy"], retrievalQueries: ["BLE project experience"], needsPersonalMemory: true, needsGeneralKnowledge: false, personalClaimsMustBeVerified: true }), 0],
  ];

  for (const [query, understanding, expectedMinimumEvidence] of cases) {
    const result = await retrieveSemanticKnowledge(undefined, query, understanding);
    if (expectedMinimumEvidence === 0 && understanding.mode === "general") {
      assertEquals(result.chunks.length, 0, `${query} should not retrieve personal memory`);
    } else if (expectedMinimumEvidence > 0) {
      assert(result.chunks.length >= expectedMinimumEvidence, `${query} missed useful personal grounding`);
    }
    const built = buildSystemPrompt(query, { understanding, knowledgeChunks: result.chunks });
    assertEquals(built.scope, understanding.mode === "general" ? "general" : "personal");
  }
});

Deno.test("personal claim verification parsing and optional resources stay internal by default", () => {
  assertEquals(parseClaimVerification('{"supported":false,"unsupported_claims":["I built box detection"]}')?.supported, false);
  assertEquals(resolveRelevantResources("Explain object detection", ["object detection"], []).length, 0);
  const cards = resolveRelevantResources(
    "Show me your exercise recognition project",
    ["TensorFlow Lite", "exercise recognition"],
    [{ id: "resume-experience" }],
  );
  assertEquals(cards[0]?.id, "adaptive-exercise-recognition");
  assertEquals(cosineSimilarity([1, 0], [1, 0]), 1);
});

Deno.test("evidence-backed resource selection is downstream, scored, and optional", async () => {
  const exercise = (await retrieveKnowledgeChunks(
    "mobile movement recognition",
    ["pose estimation", "on-device exercise classification"],
    10,
  )).find((chunk) => chunk.id === "projects-2");
  if (!exercise) throw new Error("exercise evidence was not available to resource selection");

  const relevant = selectEvidenceBackedResources(
    ["pose detection", "on-device ML", "TensorFlow Lite"],
    [exercise],
  );
  assertEquals(relevant.resources[0]?.id, "adaptive-exercise-recognition");
  assert((relevant.diagnostics[0]?.score ?? 0) >= 0.79, "related resource score was below threshold");

  const unrelated = selectEvidenceBackedResources(["object detection definition"], []);
  assertEquals(unrelated.resources.length, 0);
});

Deno.test("evidence reranking keeps only material experience and exposes an analogy plan to generation", async () => {
  const understanding = testUnderstanding({
    mode: "blended",
    intent: "advice",
    topics: ["human movement recognition", "camera", "temporal pose analysis"],
    retrievalQueries: ["camera exercise recognition noisy joints validation false positives"],
    needsPersonalMemory: true,
    needsGeneralKnowledge: true,
  });
  const candidates = (await retrieveSemanticKnowledge(undefined, "How would you analyze a new movement with a phone camera?", understanding)).chunks;
  const relevant = candidates.find((chunk) => /exercise recognition|pose landmarks|joint|squat/i.test(chunk.content));
  if (!relevant) throw new Error("movement question did not produce a relevant candidate");

  const selection = parseEvidenceSelection(JSON.stringify({
    selected_ids: [relevant.id],
    connections: [{
      evidence_id: relevant.id,
      relevance: "analogical",
      informs_reasoning: "Past camera movement work makes temporal joint stability and real-world validation useful starting points.",
      transferable_lessons: ["Smooth noisy landmarks before classifying movement."],
    }],
  }), candidates);
  assertEquals(selection?.chunks.length, 1);
  assertEquals(selection?.connections[0]?.relevance, "analogical");
  assertEquals(selection?.connections[0]?.transferableLessons.length, 1);

  const built = buildSystemPrompt("How would you analyze a new movement with a phone camera?", {
    understanding,
    knowledgeChunks: selection?.chunks ?? [],
    evidenceConnections: selection?.connections ?? [],
  });
  assert(built.systemPrompt.includes("EXPERIENCE-INFORMED BLENDED ANSWER"), "blended synthesis instruction missing");
  assert(built.systemPrompt.includes("WHY THE SELECTED EXPERIENCE MATTERS"), "analogy plan missing from generation prompt");
  assert(built.systemPrompt.includes("VERIFIED RELEVANT NIZAM EXPERIENCE"), "verified evidence missing from generation prompt");
  assert(!built.systemPrompt.includes("Room database migration"), "irrelevant evidence leaked into prompt");
});

Deno.test("unseen cross-domain questions retrieve useful evidence without encoding question-specific rules", async () => {
  const cases: Array<[string, string[], string, RegExp]> = [
    ["How would you recognize an unfamiliar body movement with a phone camera?", ["movement recognition", "pose trajectories", "camera"], "exercise recognition pose validation", /exercise recognition|pose landmarks|squat/i],
    ["Would you trust raw landmark coordinates directly?", ["noisy landmarks", "coordinate smoothing", "sensor reliability"], "noisy pose joint coordinates smoothing", /smooth noisy pose|landmark jitter|kalman/i],
    ["How would you build an offline visual coaching feature?", ["offline computer vision", "on-device inference", "feedback"], "on-device exercise classification validation", /tensorflow lite|on-device inference|exercise recognition/i],
    ["What if a vision feature passed lab testing but failed in real homes?", ["production reliability", "lighting", "false positives"], "real user camera failures lighting false positives", /poor lighting|false positives|real session/i],
    ["How would you keep a large Android codebase from coupling every feature together?", ["Android modularization", "architecture boundaries", "feature isolation"], "modular Android architecture feature boundaries", /modular|architecture|feature-first/i],
    ["What would you inspect when local networking behaves differently across network types?", ["Android networking", "timeouts", "transport reliability"], "Android TCP local network reliability latency", /tcp|network reliability|latency/i],
    ["What would you consider before modernizing a legacy Android UI?", ["legacy Android modernization", "Compose migration", "architecture"], "MVP MVVM Compose migration tradeoffs", /compose|mvp|mvvm|moderniz/i],
  ];

  for (const [question, topics, retrievalQuery, expectedEvidence] of cases) {
    const understanding = testUnderstanding({
      mode: "blended",
      intent: "advice",
      topics,
      retrievalQueries: [retrievalQuery],
      needsPersonalMemory: true,
      needsGeneralKnowledge: true,
    });
    const result = await retrieveSemanticKnowledge(undefined, question, understanding);
    assert(
      result.chunks.some((chunk) => expectedEvidence.test(chunk.content)),
      `${question} did not retrieve materially relevant experience`,
    );
  }
});

Deno.test("general and unsupported-experience prompts preserve the identity boundary", () => {
  const general = testUnderstanding({
    mode: "general",
    intent: "general_question",
    needsPersonalMemory: false,
    needsGeneralKnowledge: true,
    personalClaimsMustBeVerified: false,
  });
  const generalPrompt = buildSystemPrompt("Why is the sky blue?", { understanding: general, knowledgeChunks: [] });
  assertEquals(generalPrompt.knowledgeChunks.length, 0);
  assert(generalPrompt.systemPrompt.includes("GENERAL ANSWER"), "general answer mode missing");

  const unsupported = testUnderstanding({
    mode: "personal",
    intent: "technical_experience",
    topics: ["an absent technology"],
    needsPersonalMemory: true,
    needsGeneralKnowledge: true,
    personalClaimsMustBeVerified: true,
  });
  const unsupportedPrompt = buildSystemPrompt("Have you used an absent technology?", { understanding: unsupported, knowledgeChunks: [] });
  assert(unsupportedPrompt.systemPrompt.includes("NO VERIFIED EVIDENCE"), "missing experience was not bounded");
});

Deno.test("original blended failure carries verified experience through retrieval, reranking, and context assembly", async () => {
  const question = "If you had to build an app that detects whether someone is throwing a proper punch using only the phone camera, how would you do it?";
  const understanding = testUnderstanding({
    mode: "blended",
    intent: "solution_design",
    topics: ["human movement recognition", "pose estimation", "joint trajectories", "temporal motion", "on-device inference"],
    retrievalQueries: ["camera-based movement recognition noisy pose joints validation", "Android on-device exercise classification real-world false positives"],
    needsPersonalMemory: true,
    needsGeneralKnowledge: true,
    personalClaimsMustBeVerified: true,
  });
  const retrieval = await retrieveSemanticKnowledge(undefined, question, understanding);
  assert(retrieval.semanticQuery.includes("human movement recognition"), "semantic concepts were not included in retrieval query");
  assert(retrieval.diagnostics.length > 0, "retrieval diagnostics were empty");
  const relevant = retrieval.chunks.filter((chunk) => /exercise recognition|pose landmarks|joint|squat|false positives/i.test(chunk.content)).slice(0, 2);
  assert(relevant.length > 0, "verified movement-recognition experience was not retrieved");

  const connections = relevant.map((chunk) => ({
    evidenceId: chunk.id,
    relevance: "analogical" as const,
    informsReasoning: "Real camera movement work informs input stabilization, validation, and production failure analysis for a new movement problem.",
    transferableLessons: ["Stabilize noisy input before classifying movement.", "Validate camera conditions before trusting a result."],
  }));
  const built = buildSystemPrompt(question, { understanding, knowledgeChunks: relevant, evidenceConnections: connections });
  const questionPosition = built.systemPrompt.indexOf("CURRENT QUESTION");
  const bridgePosition = built.systemPrompt.indexOf("WHY THE SELECTED EXPERIENCE MATTERS");
  const evidencePosition = built.systemPrompt.indexOf("VERIFIED RELEVANT NIZAM EXPERIENCE");
  assert(questionPosition >= 0 && bridgePosition > questionPosition && evidencePosition > bridgePosition, "generation context is ordered incorrectly");
  assert(built.systemPrompt.includes("INTERNAL SYNTHESIS"), "transferable-lesson synthesis instruction missing");
  assert(built.systemPrompt.includes("model training from conversion, deployment, and inference runtimes"), "technology-role accuracy instruction missing");
  assertEquals(resolveRelevantResources(question, understanding.topics, relevant).length, 0, "retrieval incorrectly forced a project card");
});

Deno.test("requested unseen evaluation set retrieves domain-appropriate evidence", async () => {
  const cases: Array<[string, string[], string, RegExp]> = [
    ["How would you detect whether someone is falling using only an Android phone camera?", ["human fall detection", "pose trajectories", "camera movement"], "camera exercise recognition pose validation false positives", /exercise recognition|pose landmarks|false positives/i],
    ["Could you build something that recognizes dance movements?", ["dance movement recognition", "temporal pose sequence", "on-device classification"], "exercise movement classification pose landmarks", /exercise recognition|pose landmarks|tensorflow lite/i],
    ["If pose landmarks keep jumping around even when the person isn't moving, what would you do?", ["landmark jitter", "coordinate smoothing", "input confidence"], "noisy pose joint coordinates smoothing lighting", /smooth noisy pose|landmark jitter|kalman/i],
    ["Suppose an exercise detector works perfectly for me but gives false positives for users. What would you investigate?", ["false positives", "real users", "input validation"], "exercise recognition production false positives session feedback", /false positives|real session|users/i],
    ["How would you detect whether somebody picked up the wrong package in a warehouse?", ["human-object interaction", "camera event recognition", "temporal validation"], "camera movement recognition validation real-world false positives", /exercise recognition|pose landmarks|false positives/i],
    ["How would you recognize a tennis serve?", ["sports movement recognition", "joint trajectories", "temporal classification"], "exercise movement recognition pose sequence", /exercise recognition|pose landmarks|squat/i],
    ["How would you approach breaking a large Android application into modules?", ["Android modularization", "feature boundaries", "dependency direction"], "modularized Android features architecture", /modular|feature-first|architecture/i],
    ["An Android app works perfectly over Wi-Fi but requests sometimes timeout over mobile data. Where would you look?", ["Android networking", "network timeout", "transport reliability"], "TCP local network reliability latency Android", /tcp|network reliability|latency/i],
    ["If you inherited an old MVP Android project, would you rewrite everything?", ["legacy MVP", "incremental modernization", "MVVM migration"], "large MVP codebase migration MVVM Compose", /mvp|mvvm|moderniz/i],
  ];

  for (const [question, topics, retrievalQuery, expected] of cases) {
    const understanding = testUnderstanding({
      mode: "blended",
      intent: "solution_design",
      topics,
      retrievalQueries: [retrievalQuery],
      needsPersonalMemory: true,
      needsGeneralKnowledge: true,
    });
    const result = await retrieveSemanticKnowledge(undefined, question, understanding);
    assert(result.chunks.some((chunk) => expected.test(chunk.content)), `${question} missed domain-appropriate experience`);
  }
});

Deno.test("technology roles remain accurate in blended generation context", async () => {
  const chunks = await retrieveKnowledgeChunks("TensorFlow Lite exercise recognition training inference");
  const exercise = chunks.find((chunk) => /training.*separate.*tensorflow lite|tensorflow lite.*on-device inference/i.test(chunk.content));
  assert(exercise, "verified context does not distinguish training from TFLite inference");
  const persona = buildSystemPrompt("How would you deploy a new mobile model?", {
    understanding: testUnderstanding({ mode: "blended", intent: "solution_design", needsPersonalMemory: true, needsGeneralKnowledge: true }),
    knowledgeChunks: exercise ? [exercise] : [],
  });
  assert(persona.systemPrompt.includes("Distinguish model training from conversion"), "runtime accuracy guard is missing");
});

Deno.test("resolves current employment deterministically from temporal facts", () => {
  const currentEmployment = resolveCurrentEmployment(TEMPORAL_FACTS);
  const latestFormer = findLatestFormerEmployment(TEMPORAL_FACTS);

  assertEquals(currentEmployment, null);
  assertEquals(latestFormer?.value.includes("Vantage Circle"), true);
  assertEquals(latestFormer?.status, "former");
  assertEquals(latestFormer?.isCurrent, false);
  assertEquals(latestFormer?.endDate, "2026-05-08");
  assertEquals(formatDisplayDate("2026-05-08"), "8 May 2026");
});

Deno.test("detects temporal employment and current-state intents", () => {
  const cases = [
    ["Where do you work currently?", "current_employment"],
    ["Where are you working now?", "current_employment"],
    ["What is your current company?", "current_employment"],
    ["Are you still at Vantage Circle?", "current_employment"],
    ["When did you leave Vantage Circle?", "employment_end_date"],
    ["Where did you work previously?", "previous_employment"],
    ["What was your latest job?", "latest_state"],
    ["What are you doing now?", "current_activity"],
    ["Tell me about your work experience.", "employment_history"],
    ["Do you currently have an employer?", "current_employment"],
  ] as const;

  for (const [query, expectedIntent] of cases) {
    assertEquals(detectTemporalIntent(query), expectedIntent, query);
  }
});

Deno.test("temporal templates never present Vantage Circle as current", () => {
  const cases = [
    ["Where do you work currently?", "previously worked at Vantage Circle", "8 May 2026"],
    ["Where are you working now?", "previously worked at Vantage Circle", "8 May 2026"],
    ["What is your current company?", "previously worked at Vantage Circle", "8 May 2026"],
    ["Are you still at Vantage Circle?", "No. I left Vantage Circle on 8 May 2026", "Senior Android Engineer"],
    ["When did you leave Vantage Circle?", "My last working day at Vantage Circle was 8 May 2026.", "8 May 2026"],
    ["Where did you work previously?", "I previously worked at Vantage Circle as a Senior Android Engineer", "8 May 2026"],
    ["What was your latest job?", "My latest job was Senior Android Engineer at Vantage Circle", "8 May 2026"],
    ["What are you doing now?", "open-source Android tooling", "exploring my next engineering opportunity"],
    ["Tell me about your work experience.", "Vantage Circle is a former employer", "KBG Software"],
    ["Do you currently have an employer?", "previously worked at Vantage Circle", "exploring my next opportunity"],
  ] as const;

  for (const [query, expectedA, expectedB] of cases) {
    const answer = getTemporalAnswer(query);
    if (!answer) {
      throw new Error(`${query} did not return a temporal answer`);
    }
    assert(answer.reply.includes(expectedA), `${query} missing ${expectedA}: ${answer.reply}`);
    assert(answer.reply.includes(expectedB), `${query} missing ${expectedB}: ${answer.reply}`);
    assert(!/currently work at Vantage Circle/i.test(answer.reply), `${query} claimed current Vantage Circle work`);
    assert(!/my current employer is Vantage Circle/i.test(answer.reply), `${query} fabricated current employer`);
    assert(Array.isArray(answer.resources), `${query} resources were not an array`);
  }
});

Deno.test("temporal validation rejects stale current employer claims", () => {
  const invalid = validatePersonalAnswer(
    "personal",
    "I currently work at Vantage Circle as a Senior Android Engineer.",
    "Where do you work currently?",
  );

  assertEquals(invalid.ok, false);
  assertEquals(invalid.kind, "temporal");
  assertEquals(
    validatePersonalAnswer(
      "personal",
      "I previously worked at Vantage Circle as a Senior Android Engineer until 8 May 2026.",
      "Where do you work currently?",
    ).ok,
    true,
  );
});

Deno.test("file lookup and query expansion helpers support local retrieval", async () => {
  assertEquals(
    (await retrieveKnowledgeChunks("Where did you learn coding?"))[0]?.id,
    "resume-career-story",
  );
  assertEquals(
    (await retrieveKnowledgeChunks("What is your qualification?"))[0]?.id,
    "resume-education",
  );

  const expansion = parseQueryExpansion('{"intent":"biography","searchTerms":["self taught coding"]}');

  assertEquals(expansion.intent, "biography");
  assertEquals(expansion.searchTerms[0], "self taught coding");
});

Deno.test("temporal source boosting retrieves current status for present-state questions", async () => {
  const currentEmployerChunks = await retrieveKnowledgeChunks("Where do you work currently?");
  const currentActivityChunks = await retrieveKnowledgeChunks("What are you doing now?");
  const state = resolveTemporalState("Where do you work currently?");

  assertEquals(state.currentEmployment, null);
  assertEquals(state.latestFormerEmployment?.endDate, "2026-05-08");
  assert(
    currentEmployerChunks.some((chunk) => chunk.source === "typescript:current-status" || /status: former|last working day/i.test(chunk.content)),
    "current employment retrieval missed temporal records",
  );
  assert(
    currentActivityChunks.some((chunk) => chunk.source === "typescript:current-status"),
    `current activity retrieval missed static current-status knowledge: ${currentActivityChunks.map((chunk) => chunk.source).join(",")}`,
  );
});

Deno.test("static knowledge orchestration supports broad personal and persona fallback cases", async () => {
  const cases = [
    ["Who are you?", "general", "grounded_synthesis", "resume-identity"],
    ["Tell me about yourself.", "general", "grounded_synthesis", "resume-identity"],
    ["Introduce yourself.", "general", "grounded_synthesis", "resume-identity"],
    ["What do you do?", "general", "grounded_synthesis", "resume-identity"],
    ["How do you handle pressure?", "personality", "persona_reasoning", "resume-mission"],
    ["What kind of leader are you?", "personality", "persona_reasoning", "resume-mission"],
    ["What would you do if ArchGuard failed?", "hypothetical", "persona_reasoning", "resume-mission"],
    ["What was your college registration number?", "education", "unknown", "resume-education"],
  ] as const;

  for (const [query, expectedIntent, expectedMode, expectedSection] of cases) {
    const detected = detectIntent(query);
    const sections = retrieveResumeSections(query);
    const chunks = await retrieveKnowledgeChunks(query);
    const mode = chooseAnswerMode(
      detected.intent === "general" ? detectQueryScope(query) : "personal",
      detected,
      sections,
      sections.length + chunks.length,
      query,
    );

    assertEquals(detected.intent, expectedIntent);
    assertEquals(mode, expectedMode);
    assert(
      sections.some((section) => section.id === expectedSection) ||
        chunks.some((chunk) => chunk.id === expectedSection),
      `${query} did not retrieve ${expectedSection}`,
    );
  }
});
