const emotionOptions = [
  "anger",
  "sadness",
  "stress",
  "overwhelm",
  "rumination",
  "panic",
  "anxiety",
  "numbness",
  "shame",
  "guilt",
  "loneliness",
  "hurt",
  "heartbreak",
  "low mood",
  "unsafe",
];

const analysisSchema = {
  type: "object",
  properties: {
    emotion: {
      type: "string",
      enum: emotionOptions,
      description: "Main plain emotion label, preferably a noun.",
    },
    emotionWords: {
      type: "array",
      items: { type: "string", enum: emotionOptions },
      minItems: 1,
      maxItems: 3,
      description: "One to three simple noun labels like anger, shame, stress, overwhelm, rumination.",
    },
    intensity: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    shortRead: {
      type: "string",
      description: "Max 16 words.",
    },
    keyPhrase: {
      type: "string",
      description: "A short concrete phrase from the user's words, max 8 words.",
    },
    tone: {
      type: "string",
      enum: ["calm", "uplifting", "steady", "grounding", "urgent"],
      description: "Chatbot tone.",
    },
    opener: {
      type: "string",
      description: "Max 22 words.",
    },
    crisis: {
      type: "boolean",
      description: "Self-harm, violence, or immediate danger.",
    },
    crisisText: {
      type: "string",
      description: "Urgent support text or empty.",
    },
  },
  required: [
    "emotion",
    "emotionWords",
    "intensity",
    "shortRead",
    "keyPhrase",
    "tone",
    "opener",
    "crisis",
    "crisisText",
  ],
  additionalProperties: false,
};

const chatSchema = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "Max 26 words.",
    },
    emotion: {
      type: "string",
      enum: emotionOptions,
      description: "Updated emotion or same.",
    },
    crisis: {
      type: "boolean",
      description: "Self-harm, violence, or immediate danger.",
    },
    crisisText: {
      type: "string",
      description: "Urgent support text or empty.",
    },
  },
  required: ["reply", "emotion", "crisis", "crisisText"],
  additionalProperties: false,
};

const analysisInstructions = `
You are Man to Man, a plain-spoken emotional classifier and support chatbot for men.
The user may not know what he feels. Classify from his own words.
Use simple emotion names, preferably nouns:
anger, sadness, stress, overwhelm, rumination, panic, anxiety, numbness, shame, guilt, loneliness, hurt, heartbreak, low mood, unsafe.
Do not return vague labels like "bad", "off", "upset", or "emotional."
Do not clinically diagnose. Never say "you have depression" or "you have anxiety disorder."
Say what it looks like emotionally.
Keep the explanation very short.
Choose a tone:
- calm: anger, hurt mixed with anger, resentment, blame, conflict, heated language. Cool him down without shaming him.
- uplifting: sadness, loneliness, heartbreak, low mood. Give hope without cheesy motivation.
- grounding: panic, anxiety, rumination, stress, overwhelm. Slow the body, reduce the spiral, narrow the next step.
- steady: numbness, shame, guilt, confusion. Honest and firm, but not harsh.
- urgent: unsafe language, self-harm, suicide, violence, immediate danger.
Every emotion must have a matching tone. Do not use the same tone for every mood.
The opener should both name the emotion and ask one short next question.
Use one concrete detail from the user's own words.
No therapy jargon. No lecture. No long advice.
Do not make women, partners, family, or others into enemies.
If self-harm, suicide, violence, or immediate danger appears:
- crisis true
- emotion "unsafe"
- tone "urgent"
- crisisText says to call/text 988 or emergency services
`;

const chatInstructions = `
You are Man to Man, a short-reply support chatbot for men.
Reply in fewer than 26 words.
Match the user's classified emotion and tone.
Use simple words. No therapy jargon. No diagnosis. No paragraphs.
Tone rules:
- calm: lower the heat, slow him down, help him not react.
- uplifting: acknowledge pain, offer hope, point to one doable step.
- grounding: steady the body, reduce the spiral, make the next step small.
- steady: honest, firm, not harsh; separate facts from self-attack.
- urgent: direct crisis safety.
The emotion has already been named. Do not keep re-naming it.
Do not repeat the classified emotion, short read, key phrase, or your last reply unless the user clearly changes topic.
After the first opener, do not start with "Sounds like", "This sounds like", or quoted key phrases.
Move the conversation forward using this rough order:
1. trigger
2. urge or reaction
3. meaning underneath
4. one tiny next action
Use the latest user message, not the original intake, as the main context.
Ask one useful question or give one tiny next step.
Sound like a calm older brother, not a worksheet.
Avoid "that makes sense" unless you add a specific reason.
Do not over-explain.
Do not hype him up.
Do not shame him.
Do not turn women, partners, family, or others into enemies.
If self-harm, suicide, violence, or immediate danger appears:
- crisis true
- tell him to call/text 988 or emergency services
- ask if he is safe right now
`;

export async function onRequest(context) {
  const { request } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  try {
    const config = getConfig(context.env);
    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname;
    const repliesMatch = pathname.match(/^\/api\/community-posts\/([^/]+)\/replies$/);

    if (request.method === "GET" && pathname === "/api/health") {
      return handleHealth(config);
    }

    if (request.method === "POST" && pathname === "/api/analyze") {
      return await handleAnalyze(request, config);
    }

    if (request.method === "POST" && pathname === "/api/chat") {
      return await handleChat(request, config);
    }

    if (request.method === "GET" && pathname === "/api/communities") {
      return await handleListCommunities(config);
    }

    if (request.method === "POST" && pathname === "/api/communities") {
      return await handleCreateCommunity(request, config);
    }

    if (request.method === "GET" && pathname === "/api/community-posts") {
      return await handleListCommunityPosts(requestUrl, config);
    }

    if (request.method === "POST" && pathname === "/api/community-posts") {
      return await handleCreateCommunityPost(request, config);
    }

    if (repliesMatch && request.method === "GET") {
      return await handleListPostReplies(repliesMatch[1], config);
    }

    if (repliesMatch && request.method === "POST") {
      return await handleCreatePostReply(repliesMatch[1], request, config);
    }

    return json(404, { error: "not_found" });
  } catch (error) {
    console.error(error.message);
    return json(error.statusCode || 500, {
      error: "server_error",
      message: error.publicMessage || error.message || "Request failed.",
      apiError: error.apiError || null,
    });
  }
}

function handleHealth(config) {
  return json(200, {
    ok: true,
    hasGroqApiKey: Boolean(config.groqApiKey),
    groqModel: config.groqModel,
    hasSupabaseUrl: Boolean(config.supabaseUrl),
    hasSupabasePublishableKey: Boolean(config.supabasePublishableKey),
  });
}

async function handleAnalyze(request, config) {
  const body = await readJson(request);
  const entry = cleanText(body.entry, 900);

  if (!entry) {
    return json(400, { error: "entry_required" });
  }

  const result = await callGroq({
    config,
    instructions: analysisInstructions,
    schemaName: "m2m_emotion_analysis",
    schema: analysisSchema,
    input: {
      user_words: entry,
      task: "Classify the likely emotion and start a short chat.",
    },
    maxCompletionTokens: config.analyzeMaxCompletionTokens,
  });

  return json(200, result);
}

async function handleChat(request, config) {
  const body = await readJson(request);
  const entry = cleanText(body.entry, 900);
  const analysis = cleanAnalysis(body.analysis);
  const messages = cleanMessages(body.messages);

  if (!entry || !messages.length) {
    return json(400, { error: "message_required" });
  }

  const conversation = messages.map((message) => ({
    role: message.role === "bot" ? "assistant" : "user",
    content: message.text,
  }));

  const result = await callGroq({
    config,
    instructions: buildChatInstructions(entry, analysis),
    schema: chatSchema,
    conversation,
    temperature: 0.5,
    maxCompletionTokens: config.chatMaxCompletionTokens,
  });

  return json(200, result);
}

function buildChatInstructions(entry, analysis) {
  return `${chatInstructions}

Context, for your understanding only (do not read it back to him):
- What he first typed: "${entry}"
- You already read this as: ${analysis.emotion || "unclear"} (tone: ${analysis.tone || "steady"}).
- Tone reminder: ${getToneGuidance(analysis.tone, analysis.emotion)}

Now answer his LAST message directly. React to the specific thing he just said in his own words. Do NOT fall back on generic breathing or grounding lines unless he is clearly panicking. Ask one real question or give one concrete next step. Never repeat an earlier reply.`;
}

async function handleListCommunities(config) {
  const notConfigured = requireSupabase(config);
  if (notConfigured) return notConfigured;

  const communities = await supabaseRequest(
    config,
    "/rest/v1/community_circles?select=id,name,description,created_at&order=created_at.desc&limit=50"
  );

  return json(
    200,
    communities.map((community) => ({
      id: community.id,
      name: community.name,
      description: community.description || "",
      createdAt: community.created_at,
    }))
  );
}

async function handleCreateCommunity(request, config) {
  const notConfigured = requireSupabase(config);
  if (notConfigured) return notConfigured;

  const body = await readJson(request);
  const name = cleanText(body.name, 80);
  const description = cleanText(body.description, 220);

  if (name.length < 2) {
    return json(400, { error: "community_required" });
  }

  const flag = moderateContent(`${name} ${description}`);
  if (flag.flagged) {
    return json(422, { error: "content_flagged", category: flag.category, message: COMMUNITY_WARNING });
  }

  const [community] = await supabaseRequest(config, "/rest/v1/community_circles", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name, description }),
  });

  return json(201, {
    id: community.id,
    name: community.name,
    description: community.description || "",
    createdAt: community.created_at,
  });
}

async function handleListCommunityPosts(requestUrl, config) {
  const notConfigured = requireSupabase(config);
  if (notConfigured) return notConfigured;

  const communityId = cleanText(requestUrl.searchParams.get("community_id"), 80);
  const filter = communityId ? `&community_id=eq.${encodeURIComponent(communityId)}` : "";
  const posts = await supabaseRequest(
    config,
    `/rest/v1/community_posts?select=id,community_id,circle,text,replies,created_at${filter}&order=created_at.desc&limit=50`
  );

  return json(200, posts.map(formatPost));
}

async function handleCreateCommunityPost(request, config) {
  const notConfigured = requireSupabase(config);
  if (notConfigured) return notConfigured;

  const body = await readJson(request);
  const communityId = cleanText(body.communityId, 80);
  const circle = cleanText(body.circle, 80);
  const text = cleanText(body.text, 900);

  if (!communityId || !circle || text.length < 3) {
    return json(400, { error: "post_required" });
  }

  const flag = moderateContent(text);
  if (flag.flagged) {
    return json(422, { error: "content_flagged", category: flag.category, message: COMMUNITY_WARNING });
  }

  const [post] = await supabaseRequest(config, "/rest/v1/community_posts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ community_id: communityId, circle, text, replies: 0 }),
  });

  return json(201, formatPost(post));
}

async function handleListPostReplies(postId, config) {
  const notConfigured = requireSupabase(config);
  if (notConfigured) return notConfigured;

  const cleanPostId = cleanText(decodeURIComponent(postId), 80);
  const replies = await supabaseRequest(
    config,
    `/rest/v1/community_replies?select=id,post_id,text,created_at&post_id=eq.${encodeURIComponent(cleanPostId)}&order=created_at.asc&limit=100`
  );

  return json(200, replies.map(formatReply));
}

async function handleCreatePostReply(postId, request, config) {
  const notConfigured = requireSupabase(config);
  if (notConfigured) return notConfigured;

  const cleanPostId = cleanText(decodeURIComponent(postId), 80);
  const body = await readJson(request);
  const text = cleanText(body.text, 700);

  if (!cleanPostId || text.length < 2) {
    return json(400, { error: "reply_required" });
  }

  const flag = moderateContent(text);
  if (flag.flagged) {
    return json(422, { error: "content_flagged", category: flag.category, message: COMMUNITY_WARNING });
  }

  const [reply] = await supabaseRequest(config, "/rest/v1/community_replies", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ post_id: cleanPostId, text }),
  });

  return json(201, formatReply(reply));
}

async function callGroq({ config, instructions, schema, input, conversation, temperature, maxCompletionTokens }) {
  if (!config.groqApiKey) {
    const error = new Error("GROQ_API_KEY is missing.");
    error.statusCode = 503;
    throw error;
  }

  const messages = [
    {
      role: "system",
      content: `${instructions}
Return only a valid JSON object. Do not include markdown, commentary, or extra text.
Return the answer object itself. Do not return a JSON schema. Do not include type, properties, required, or additionalProperties.
The JSON object must match this schema:
${JSON.stringify(schema)}`,
    },
  ];

  if (Array.isArray(conversation) && conversation.length) {
    for (const turn of conversation) {
      messages.push({ role: turn.role, content: turn.content });
    }
  } else {
    messages.push({ role: "user", content: JSON.stringify(input) });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.groqApiKey}`,
    },
    body: JSON.stringify({
      model: config.groqModel,
      messages,
      temperature: typeof temperature === "number" ? temperature : 0.2,
      max_completion_tokens: maxCompletionTokens,
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error?.message || "Groq request failed.");
    error.statusCode = response.status;
    error.apiError = classifyGroqError(data?.error, response.status);
    throw error;
  }

  const text = extractGroqOutputText(data);
  if (!text) {
    throw new Error("Groq returned no text.");
  }

  return normalizeModelResult(parseModelJson(text));
}

async function supabaseRequest(config, endpoint, options = {}) {
  const response = await fetch(`${config.supabaseUrl}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      apikey: config.supabasePublishableKey,
      Authorization: `Bearer ${config.supabasePublishableKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  const text = await response.text();
  const data = parseJson(text);

  if (!response.ok) {
    const message = data?.message || data?.error_description || "Supabase request failed.";
    const error = new Error(message);
    error.publicMessage = message;
    error.statusCode = response.status;
    throw error;
  }

  return data || [];
}

const COMMUNITY_WARNING =
  "This breaks a house rule: no hate, no misogyny, no bullying. You can be honest, angry, and real without attacking anyone. Rephrase it and it will post.";

const bannedTerms = [
  "nigger",
  "niggers",
  "faggot",
  "faggots",
  "retard",
  "retarded",
  "tranny",
  "spic",
  "chink",
  "kike",
  "coon",
  "wetback",
  "cunt",
  "whore",
  "slut",
  "slag",
  "kill yourself",
  "kys",
  "you should die",
  "you deserve to die",
  "go kill yourself",
  "go die",
  "hang yourself",
  "neck yourself",
];

function moderateContent(text) {
  const normalized = String(text || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return { flagged: false };
  }

  const padded = ` ${normalized} `;

  for (const term of bannedTerms) {
    if (term.includes(" ")) {
      if (normalized.includes(term)) {
        return { flagged: true, category: "community_rule", term };
      }
    } else if (padded.includes(` ${term} `)) {
      return { flagged: true, category: "community_rule", term };
    }
  }

  return { flagged: false };
}

function requireSupabase(config) {
  if (config.supabaseUrl && config.supabasePublishableKey) {
    return null;
  }

  return json(503, {
    error: "supabase_not_configured",
    message: "Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Cloudflare Variables and Secrets.",
  });
}

function getConfig(env) {
  return {
    groqApiKey: cleanText(env.GROQ_API_KEY, 2000),
    groqModel: cleanText(env.GROQ_MODEL, 80) || "llama-3.3-70b-versatile",
    analyzeMaxCompletionTokens: readPositiveInt(env.GROQ_ANALYZE_MAX_COMPLETION_TOKENS, 220),
    chatMaxCompletionTokens: readPositiveInt(env.GROQ_CHAT_MAX_COMPLETION_TOKENS, 200),
    supabaseUrl: normalizeSupabaseUrl(env.SUPABASE_URL),
    supabasePublishableKey:
      cleanText(env.SUPABASE_PUBLISHABLE_KEY, 2000) || cleanText(env.SUPABASE_ANON_KEY, 2000),
  };
}

function formatPost(post) {
  return {
    id: post.id,
    communityId: post.community_id || "",
    circle: post.circle,
    text: post.text,
    replies: Number(post.replies || 0),
    createdAt: post.created_at,
  };
}

function formatReply(reply) {
  return {
    id: reply.id,
    postId: reply.post_id,
    text: reply.text,
    createdAt: reply.created_at,
  };
}

function normalizeSupabaseUrl(value) {
  const clean = cleanText(value, 300).replace(/\/+$/g, "");
  return clean && /^https:\/\/.+\.supabase\.co$/.test(clean) ? clean : "";
}

function extractGroqOutputText(data) {
  return data?.choices?.[0]?.message?.content || "";
}

function parseModelJson(text) {
  const clean = String(text || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  const jsonText = start >= 0 && end > start ? clean.slice(start, end + 1) : clean;
  return JSON.parse(jsonText);
}

function normalizeModelResult(result) {
  const output =
    result && !result.emotion && result.properties && typeof result.properties === "object"
      ? { ...result.properties }
      : { ...(result || {}) };

  if (typeof output.crisis === "string") {
    output.crisis = output.crisis.toLowerCase() === "true";
  }

  if (typeof output.emotionWords === "string") {
    output.emotionWords = output.emotionWords
      .split(/[,+]/)
      .map((word) => word.trim())
      .filter(Boolean);
  }

  delete output.type;
  delete output.properties;
  delete output.required;
  delete output.additionalProperties;

  return output;
}

function classifyGroqError(error, statusCode) {
  const message = cleanText(error?.message, 220);
  const code = cleanText(error?.code, 80);
  const type = cleanText(error?.type, 80);
  const lower = `${message} ${code} ${type}`.toLowerCase();

  if (
    statusCode === 429 ||
    lower.includes("quota") ||
    lower.includes("billing") ||
    lower.includes("credits") ||
    lower.includes("rate limit")
  ) {
    return {
      kind: "quota",
      message: "Groq says this project has no available API quota, hit a rate limit, or hit a spend limit.",
      statusCode,
      code,
      type,
    };
  }

  if (statusCode === 401 || lower.includes("api key") || lower.includes("auth")) {
    return {
      kind: "auth",
      message: "Groq says the API key is missing, invalid, revoked, or from the wrong project.",
      statusCode,
      code,
      type,
    };
  }

  return {
    kind: "api",
    message: message || "Groq API request failed.",
    statusCode,
    code,
    type,
  };
}

function cleanAnalysis(analysis) {
  return {
    emotion: cleanText(analysis?.emotion, 80),
    tone: cleanText(analysis?.tone, 40),
    shortRead: cleanText(analysis?.shortRead, 220),
    keyPhrase: cleanText(analysis?.keyPhrase, 120),
  };
}

function getToneGuidance(tone, emotion) {
  const cleanTone = cleanText(tone, 40);
  const cleanEmotion = cleanText(emotion, 80);

  const guidance = {
    calm:
      "The user is heated. Do not fuel it. Slow him down, validate the pressure, and guide one non-reactive next move.",
    uplifting:
      "The user is hurting or low. Be warm and hopeful without hype. Give one small forward step.",
    grounding:
      "The user is spiraling or overwhelmed. Bring attention to the body, the next ten minutes, or one controllable action.",
    steady:
      "The user may be numb, ashamed, or confused. Be honest and firm, but not harsh. Separate facts from self-attack.",
    urgent:
      "Prioritize immediate safety. Tell the user to contact crisis support or emergency services.",
  };

  return guidance[cleanTone] || `Match ${cleanEmotion || "the user's state"} with short, practical support.`;
}

function cleanMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.slice(-6).map((message) => ({
    role: message?.role === "bot" ? "bot" : "user",
    text: cleanText(message?.text, 320),
  }));
}

async function readJson(request) {
  const text = await request.text();

  if (text.length > 24000) {
    const error = new Error("Request too large.");
    error.statusCode = 413;
    throw error;
  }

  return parseJson(text || "{}") || {};
}

function parseJson(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function json(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
