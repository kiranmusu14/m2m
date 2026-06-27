const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { URL } = require("node:url");

const rootDir = __dirname;
const port = Number(process.env.PORT || 3000);

loadEnv(path.join(rootDir, ".env"));

const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || "gpt-5.4-nano";
const openaiReasoningEffort = process.env.OPENAI_REASONING_EFFORT || "none";
const analyzeMaxOutputTokens = readPositiveInt(process.env.OPENAI_ANALYZE_MAX_OUTPUT_TOKENS, 220);
const chatMaxOutputTokens = readPositiveInt(process.env.OPENAI_CHAT_MAX_OUTPUT_TOKENS, 80);
const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

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

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = requestUrl.pathname;
    const repliesMatch = pathname.match(/^\/api\/community-posts\/([^/]+)\/replies$/);

    if (req.method === "POST" && pathname === "/api/analyze") {
      await handleAnalyze(req, res);
      return;
    }

    if (req.method === "POST" && pathname === "/api/chat") {
      await handleChat(req, res);
      return;
    }

    if (req.method === "GET" && pathname === "/api/communities") {
      await handleListCommunities(res);
      return;
    }

    if (req.method === "POST" && pathname === "/api/communities") {
      await handleCreateCommunity(req, res);
      return;
    }

    if (req.method === "GET" && pathname === "/api/community-posts") {
      await handleListCommunityPosts(requestUrl, res);
      return;
    }

    if (req.method === "POST" && pathname === "/api/community-posts") {
      await handleCreateCommunityPost(req, res);
      return;
    }

    if (repliesMatch && req.method === "GET") {
      await handleListPostReplies(repliesMatch[1], res);
      return;
    }

    if (repliesMatch && req.method === "POST") {
      await handleCreatePostReply(repliesMatch[1], req, res);
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { error: "method_not_allowed" });
  } catch (error) {
    console.error(error.message);
    sendJson(res, error.statusCode || 500, {
      error: "server_error",
      message: error.publicMessage || "Request failed.",
      apiError: error.apiError || null,
    });
  }
});

server.listen(port, () => {
  console.log(`Man to Man running at http://localhost:${port}`);
  if (!openaiApiKey) {
    console.log("OPENAI_API_KEY is missing. The browser will use the local fallback.");
  }
});

async function handleAnalyze(req, res) {
  const body = await readJson(req);
  const entry = cleanText(body.entry, 900);

  if (!entry) {
    sendJson(res, 400, { error: "entry_required" });
    return;
  }

  const result = await callOpenAI({
    instructions: analysisInstructions,
    schemaName: "m2m_emotion_analysis",
    schema: analysisSchema,
    input: {
      user_words: entry,
      task: "Classify the likely emotion and start a short chat.",
    },
    maxOutputTokens: analyzeMaxOutputTokens,
  });

  sendJson(res, 200, result);
}

async function handleChat(req, res) {
  const body = await readJson(req);
  const entry = cleanText(body.entry, 900);
  const analysis = cleanAnalysis(body.analysis);
  const messages = cleanMessages(body.messages);

  if (!entry || !messages.length) {
    sendJson(res, 400, { error: "message_required" });
    return;
  }

  const result = await callOpenAI({
    instructions: chatInstructions,
    schemaName: "m2m_chat_reply",
    schema: chatSchema,
    input: {
      original_words: entry,
      classified_emotion: analysis.emotion,
      tone: analysis.tone,
      tone_guidance: getToneGuidance(analysis.tone, analysis.emotion),
      short_read: analysis.shortRead,
      key_phrase: analysis.keyPhrase,
      chat: messages,
      user_turn_count: messages.filter((message) => message.role === "user").length,
      last_bot_reply: [...messages].reverse().find((message) => message.role === "bot")?.text || "",
      recent_bot_replies: messages
        .filter((message) => message.role === "bot")
        .slice(-3)
        .map((message) => message.text),
      task: "Reply briefly and keep the conversation moving.",
    },
    maxOutputTokens: chatMaxOutputTokens,
  });

  sendJson(res, 200, result);
}

async function handleListCommunities(res) {
  if (!isSupabaseConfigured()) {
    sendJson(res, 503, {
      error: "supabase_not_configured",
      message: "Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to .env.",
    });
    return;
  }

  const communities = await supabaseRequest(
    "/rest/v1/community_circles?select=id,name,description,created_at&order=created_at.desc&limit=50"
  );

  sendJson(
    res,
    200,
    communities.map((community) => ({
      id: community.id,
      name: community.name,
      description: community.description || "",
      createdAt: community.created_at,
    }))
  );
}

async function handleCreateCommunity(req, res) {
  if (!isSupabaseConfigured()) {
    sendJson(res, 503, {
      error: "supabase_not_configured",
      message: "Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to .env.",
    });
    return;
  }

  const body = await readJson(req);
  const name = cleanText(body.name, 80);
  const description = cleanText(body.description, 220);

  if (name.length < 2) {
    sendJson(res, 400, { error: "community_required" });
    return;
  }

  const [community] = await supabaseRequest("/rest/v1/community_circles", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name, description }),
  });

  sendJson(res, 201, {
    id: community.id,
    name: community.name,
    description: community.description || "",
    createdAt: community.created_at,
  });
}

async function handleListCommunityPosts(requestUrl, res) {
  if (!isSupabaseConfigured()) {
    sendJson(res, 503, {
      error: "supabase_not_configured",
      message: "Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to .env.",
    });
    return;
  }

  const communityId = cleanText(requestUrl.searchParams.get("community_id"), 80);
  const filter = communityId ? `&community_id=eq.${encodeURIComponent(communityId)}` : "";
  const posts = await supabaseRequest(
    `/rest/v1/community_posts?select=id,community_id,circle,text,replies,created_at${filter}&order=created_at.desc&limit=50`
  );

  sendJson(
    res,
    200,
    posts.map(formatPost)
  );
}

async function handleCreateCommunityPost(req, res) {
  if (!isSupabaseConfigured()) {
    sendJson(res, 503, {
      error: "supabase_not_configured",
      message: "Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to .env.",
    });
    return;
  }

  const body = await readJson(req);
  const communityId = cleanText(body.communityId, 80);
  const circle = cleanText(body.circle, 80);
  const text = cleanText(body.text, 900);

  if (!communityId || !circle || text.length < 3) {
    sendJson(res, 400, { error: "post_required" });
    return;
  }

  const [post] = await supabaseRequest("/rest/v1/community_posts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ community_id: communityId, circle, text, replies: 0 }),
  });

  sendJson(res, 201, formatPost(post));
}

async function handleListPostReplies(postId, res) {
  if (!isSupabaseConfigured()) {
    sendJson(res, 503, {
      error: "supabase_not_configured",
      message: "Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to .env.",
    });
    return;
  }

  const cleanPostId = cleanText(decodeURIComponent(postId), 80);
  const replies = await supabaseRequest(
    `/rest/v1/community_replies?select=id,post_id,text,created_at&post_id=eq.${encodeURIComponent(cleanPostId)}&order=created_at.asc&limit=100`
  );

  sendJson(
    res,
    200,
    replies.map(formatReply)
  );
}

async function handleCreatePostReply(postId, req, res) {
  if (!isSupabaseConfigured()) {
    sendJson(res, 503, {
      error: "supabase_not_configured",
      message: "Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to .env.",
    });
    return;
  }

  const cleanPostId = cleanText(decodeURIComponent(postId), 80);
  const body = await readJson(req);
  const text = cleanText(body.text, 700);

  if (!cleanPostId || text.length < 2) {
    sendJson(res, 400, { error: "reply_required" });
    return;
  }

  const [reply] = await supabaseRequest("/rest/v1/community_replies", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ post_id: cleanPostId, text }),
  });

  sendJson(res, 201, formatReply(reply));
}

async function callOpenAI({ instructions, schemaName, schema, input, maxOutputTokens }) {
  if (!openaiApiKey) {
    const error = new Error("OPENAI_API_KEY is missing.");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      reasoning: { effort: openaiReasoningEffort },
      max_output_tokens: maxOutputTokens,
      instructions,
      input: JSON.stringify(input),
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error?.message || "OpenAI request failed.");
    error.statusCode = response.status;
    error.apiError = classifyOpenAIError(data?.error, response.status);
    throw error;
  }

  const text = extractOutputText(data);
  if (!text) {
    throw new Error("OpenAI returned no text.");
  }

  return JSON.parse(text);
}

async function supabaseRequest(endpoint, options = {}) {
  const response = await fetch(`${supabaseUrl}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${supabasePublishableKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error_description || "Supabase request failed.";
    const error = new Error(message);
    error.publicMessage = message;
    error.statusCode = response.status;
    throw error;
  }

  return data || [];
}

function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
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

function extractOutputText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return "";
}

function classifyOpenAIError(error, statusCode) {
  const message = cleanText(error?.message, 220);
  const code = cleanText(error?.code, 80);
  const type = cleanText(error?.type, 80);
  const lower = `${message} ${code} ${type}`.toLowerCase();

  if (lower.includes("quota") || lower.includes("billing") || lower.includes("credits")) {
    return {
      kind: "quota",
      message: "OpenAI says this project has no available API quota or hit a budget limit.",
      statusCode,
      code,
      type,
    };
  }

  if (statusCode === 401 || lower.includes("api key") || lower.includes("auth")) {
    return {
      kind: "auth",
      message: "OpenAI says the API key is invalid, revoked, or from the wrong project.",
      statusCode,
      code,
      type,
    };
  }

  return {
    kind: "api",
    message: message || "OpenAI API request failed.",
    statusCode,
    code,
    type,
  };
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const decodedPath = decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(rootDir, decodedPath));

  if (!filePath.startsWith(rootDir)) {
    sendJson(res, 403, { error: "forbidden" });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: "not_found" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    res.end(data);
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 24000) {
        req.destroy();
        reject(new Error("Request too large."));
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
  });
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

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
