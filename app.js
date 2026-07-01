const pages = [
  ["home", "Home"],
  ["checkin", "Check-In"],
  ["reset", "Reset"],
  ["talk", "Hard Talks"],
  ["daily", "Daily"],
  ["community", "Community"],
  ["guide", "AI Guide"],
];

const state = {
  page: getInitialPage(),
  entry: "",
  analysis: null,
  messages: [],
  isThinking: false,
  communityLoaded: false,
  communityLoading: false,
  communityError: "",
  communityWarning: "",
  communities: [],
  activeCommunityId: "",
  activeCommunityName: "",
  communityReplies: {},
  communityPosts: [],
  activeReset: null,
  resetStep: 0,
  talkWho: "",
  talkPlan: null,
  talkLoading: false,
  talkError: "",
};

const starterCircles = [
  ["Breakups", "Get through the replay without losing your dignity."],
  ["Marriage", "Stay honest inside the hardest partnership there is."],
  ["Fatherhood", "Raise them right while you're still figuring yourself out."],
  ["Divorce", "Rebuild when the ground moves under you."],
  ["Career stress", "Pressure, money, and work without the spiral."],
  ["Loneliness", "Connection without performing."],
  ["Purpose", "Figure out what the next chapter is actually for."],
  ["Addiction recovery", "One day at a time, with men who get it."],
  ["Grief", "Carry the loss without carrying it alone."],
  ["Anger", "Use the signal without burning what matters."],
];

const checkInChips = [
  "Angry",
  "Numb",
  "Lonely",
  "Burned out",
  "Stressed",
  "Lost",
  "Ashamed",
  "Heartbroken",
  "Overthinking",
  "Unmotivated",
  "Fine, but not really",
];

const resetGuides = [
  {
    id: "anger",
    title: "Cool Down",
    tag: "Anger",
    blurb: "Ten minutes to stop reacting and choose the move you'll respect tomorrow.",
    steps: [
      ["Delay the reaction", "2 min", "Step back. Don't send the text, say the sentence, or make the call yet. Just pause."],
      ["Drop the charge", "3 min", "Breathe out longer than you breathe in. Ten slow breaths. Let your shoulders down."],
      ["Name the line", "3 min", "What line got crossed? Say it in one plain sentence, no insults."],
      ["Pick the clean move", "2 min", "Decide the one response you'd still respect yourself for tomorrow."],
    ],
    action: "Wait 20 minutes before you respond. Then say the one plain sentence, not the insult.",
  },
  {
    id: "anxiety",
    title: "Ground Yourself",
    tag: "Anxiety",
    blurb: "Slow the body and shrink the future down to the next ten minutes.",
    steps: [
      ["Land in the room", "2 min", "Name 5 things you see, 4 you can touch, 3 you can hear. Come back to now."],
      ["Slow the engine", "3 min", "Breathe in for 4, out for 6. Repeat until your chest loosens."],
      ["Name the prediction", "3 min", "Write the exact thing your mind says will go wrong."],
      ["Shrink it", "2 min", "Ask: what's the next 10 minutes, not the whole future?"],
    ],
    action: "Do one small controllable thing in the next 10 minutes. Just one.",
  },
  {
    id: "overthinking",
    title: "Break the Loop",
    tag: "Overthinking",
    blurb: "Stop feeding the replay and get out of your head with your body.",
    steps: [
      ["Catch the loop", "2 min", "Write the thought that keeps repeating. Once. On paper or notes."],
      ["Answer or park it", "3 min", "Is there an answer right now? If yes, decide. If no, park it."],
      ["Set the window", "3 min", "Give the thought a 10-minute slot later today, not now."],
      ["Move the body", "2 min", "Stand up, walk, change rooms. Interrupt the replay physically."],
    ],
    action: "Do one physical thing for 10 minutes. Movement ends the loop faster than thinking.",
  },
  {
    id: "shame",
    title: "Separate Fact From Attack",
    tag: "Shame",
    blurb: "Tell the difference between what happened and how you're punishing yourself.",
    steps: [
      ["Write what happened", "3 min", "Just the facts. No judgment words yet."],
      ["Spot the attack", "2 min", "Underline where you called yourself names instead of stating facts."],
      ["Say it straight", "3 min", "What would you tell a brother in the exact same spot?"],
      ["Find one repair", "2 min", "Is there one honest action or apology worth making?"],
    ],
    action: "Make the one repair, or write the one apology. Small and honest beats perfect.",
  },
  {
    id: "breakup",
    title: "Get Through the Hour",
    tag: "Breakups",
    blurb: "Ride out the wave without doing something you'll regret.",
    steps: [
      ["Stop the check", "2 min", "Put the phone down. Don't open their profile or your old messages."],
      ["Let it hurt", "3 min", "Name what you miss, out loud or on paper. Missing someone is normal."],
      ["Protect your dignity", "3 min", "Write the message you want to send. Do not send it."],
      ["One kind thing", "2 min", "Water, food, a walk, or a call to someone safe."],
    ],
    action: "Text one person who has your back. You don't have to carry this alone.",
  },
  {
    id: "loneliness",
    title: "Reach Out",
    tag: "Loneliness",
    blurb: "Turn a heavy feeling into one small, real connection.",
    steps: [
      ["Name it without shame", "2 min", "Lonely is a signal, not a weakness. You're wired to need people."],
      ["Pick one person", "3 min", "Who's safest to send one honest sentence to?"],
      ["Lower the bar", "3 min", "You don't need a deep talk. 'Thinking of you, how are you?' counts."],
      ["Send it", "2 min", "Send one message. That's the whole task."],
    ],
    action: "Send one honest message to one person now. Connection beats performing.",
  },
  {
    id: "conflict",
    title: "Reset Before You Talk",
    tag: "Conflict",
    blurb: "Cool the heat and go in with one point instead of a fight.",
    steps: [
      ["Cool the heat", "2 min", "Breathe out slow. You can't fix this while you're flooded."],
      ["Find your one point", "3 min", "What's the single thing you actually need heard?"],
      ["Drop the ammo", "3 min", "Cut the insults and the 'you always'. Keep the point."],
      ["Open soft", "2 min", "Plan a first sentence that invites, not attacks."],
    ],
    action: "Open with: 'I want to sort this out, not win it.' Then say your one point.",
  },
  {
    id: "sleep",
    title: "Wind Down",
    tag: "Sleep",
    blurb: "Unload your head and let rest be the goal, not forced sleep.",
    steps: [
      ["Cut the input", "2 min", "Screen down, lights low. Let the room get dull and quiet."],
      ["Unload the head", "3 min", "Write tomorrow's worries on paper so your mind can drop them."],
      ["Slow the breath", "3 min", "In for 4, hold 4, out for 6. Let each out-breath sink you down."],
      ["Let go of trying", "2 min", "Rest is enough. You don't have to force sleep to happen."],
    ],
    action: "Lie down, breathe out long, and let rest be the goal. Not sleep. Rest.",
  },
];

const patterns = {
  unsafe: [
    "kill myself",
    "hurt myself",
    "end it",
    "suicide",
    "want to die",
    "dont want to live",
    "don't want to live",
    "disappear forever",
    "not wake up",
    "hurt someone",
    "do something bad",
  ],
  anger: ["angry", "pissed", "rage", "furious", "snap", "explode", "yell", "disrespect", "mad"],
  "low mood": ["depressed", "empty", "hopeless", "worthless", "nothing matters", "no point", "low"],
  sadness: ["sad", "cry", "hurt", "grief", "lost", "rejected"],
  heartbreak: ["miss her", "miss him", "breakup", "broke up", "heartbroken", "divorce"],
  panic: ["panic", "can't breathe", "cant breathe", "racing", "scared", "can't sleep", "cant sleep"],
  anxiety: ["anxious", "anxiety", "nervous", "uneasy", "worried"],
  numbness: ["numb", "blank", "nothing", "shut down", "shutdown", "don't care", "dont care"],
  shame: ["ashamed", "shame", "failure", "failed", "loser", "hate myself", "embarrassed"],
  guilt: ["guilt", "guilty", "regret", "my fault", "i messed up"],
  loneliness: ["lonely", "alone", "isolated", "no one", "nobody", "ignored"],
  overwhelm: ["overwhelmed", "too much", "can't handle", "cant handle", "drowning", "buried"],
  rumination: ["can't stop thinking", "cant stop thinking", "keep thinking", "replaying", "looping", "obsessing"],
  stress: ["stress", "stressed", "pressure", "work", "money", "bills", "job"],
};

const toneByEmotion = {
  unsafe: "urgent",
  anger: "calm",
  panic: "grounding",
  anxiety: "grounding",
  sadness: "uplifting",
  heartbreak: "uplifting",
  "low mood": "uplifting",
  loneliness: "uplifting",
  numbness: "steady",
  shame: "steady",
  guilt: "steady",
  overwhelm: "grounding",
  rumination: "grounding",
  stress: "grounding",
};

const toneProfiles = {
  calm: "lower the heat, slow reaction, ask for the line that got crossed",
  uplifting: "acknowledge pain, add realistic hope, suggest one small forward step",
  grounding: "slow the body, reduce the spiral, narrow the next ten minutes",
  steady: "separate facts from self-attack, stay honest and firm",
  urgent: "focus on immediate safety and real-world crisis support",
};

const toneLabelMap = {
  calm: "Calming",
  uplifting: "Uplifting",
  grounding: "Grounding",
  steady: "Steady",
  urgent: "Urgent",
};

const localReads = {
  unsafe: ["This needs another human now.", "This sounds unsafe. Are you safe right now?"],
  anger: ["This looks like anger, maybe with hurt under it.", "Anger is on top. Slow down first. What felt crossed?"],
  "low mood": ["This looks heavy, low, and hard to carry.", "This is heavy, but movable. What is one small thing you can do?"],
  sadness: ["This looks like sadness or hurt.", "This hurts, but you are not stuck here. What part hits hardest?"],
  heartbreak: ["This looks like heartbreak or attachment pain.", "Heartbreak can make one person feel like oxygen. What keeps replaying?"],
  panic: ["This looks like panic or alarm.", "Start with the body. Where do you feel it?"],
  anxiety: ["This looks like anxiety or worry.", "What is your mind predicting?"],
  numbness: ["This looks like numbness or shutdown.", "When did you go quiet?"],
  shame: ["This looks like shame or self-attack.", "What are you calling yourself?"],
  guilt: ["This looks like guilt or regret.", "Is there a repair to make?"],
  loneliness: ["This looks like loneliness, even if you want space.", "Who do you wish understood?"],
  overwhelm: ["This looks like overwhelm: too much at once.", "What is the loudest pressure?"],
  rumination: ["This looks like rumination: your mind looping.", "What thought keeps looping?"],
  stress: ["This looks like stress and pressure.", "What needs attention first?"],
};

const emotionLibrary = {
  anger: {
    what: "Anger is a signal that a line got crossed, or that hurt is hiding underneath.",
    why: "Your body preps for a fight before your brain votes on it. That's wiring, not character.",
    steps: ["Delay the reaction 20 minutes.", "Name the line that got crossed in one plain sentence.", "Pick the response you'd respect tomorrow."],
  },
  sadness: {
    what: "Sadness is the weight of losing something that mattered.",
    why: "It slows you down on purpose so you can process the loss instead of outrunning it.",
    steps: ["Name what you lost, out loud or on paper.", "Tell one person one honest sentence.", "Do one kind thing for yourself tonight."],
  },
  stress: {
    what: "Stress is too much demand hitting too little capacity.",
    why: "Your system treats a full inbox like a threat. The pressure is real; the emergency usually isn't.",
    steps: ["Write everything down, once.", "Pick the single loudest thing.", "Park the rest until tomorrow."],
  },
  overwhelm: {
    what: "Overwhelm is every problem talking at the same time.",
    why: "The brain can't rank ten fires at once, so it freezes or spins.",
    steps: ["Pick one controllable thing.", "Do ten minutes of it.", "Let done beat perfect."],
  },
  rumination: {
    what: "Rumination is your mind replaying the same tape looking for certainty.",
    why: "The loop feels like problem-solving, but it never closes because it wants a guarantee that doesn't exist.",
    steps: ["Write the loop down once.", "Give it a 10-minute slot later today.", "Move your body to change the channel."],
  },
  panic: {
    what: "Panic is a false alarm at full volume: body first, story second.",
    why: "Your alarm system fired without checking the facts. It's frightening, not dangerous.",
    steps: ["Breathe out longer than in, ten times.", "Name 5 things you can see.", "Face the next ten minutes only."],
  },
  anxiety: {
    what: "Anxiety is your mind rehearsing a future that hasn't happened.",
    why: "It's a prediction machine that overweights threat when you're tired, stretched, or uncertain.",
    steps: ["Write the exact prediction down.", "Mark what you control vs. don't.", "Act on one controllable piece now."],
  },
  numbness: {
    what: "Numbness is the system going quiet after carrying too much for too long.",
    why: "Shutting down is protection. It kept you moving; now it's costing you connection.",
    steps: ["Do one small physical thing.", "Name when you went quiet.", "Let one safe person know you're flat."],
  },
  shame: {
    what: "Shame says YOU are the problem, instead of the thing you did.",
    why: "It grows in silence and self-attack, and shrinks the moment it's said out loud to someone safe.",
    steps: ["Write the facts without insults.", "Say what you'd tell a brother in your spot.", "Make one honest repair if one exists."],
  },
  guilt: {
    what: "Guilt is your values telling you an action missed the mark.",
    why: "Unlike shame, guilt is useful: it points at behavior you can actually repair.",
    steps: ["Separate repair from punishment.", "Make the clean apology or fix.", "Then let the debt close."],
  },
  loneliness: {
    what: "Loneliness is the gap between the connection you have and the connection you need.",
    why: "You're wired to need people. The signal is healthy; isolation is what does the damage.",
    steps: ["Pick the safest person you know.", "Send one honest sentence.", "Say yes to the next small invite."],
  },
  hurt: {
    what: "Hurt is the bruise left when someone or something hit a soft spot.",
    why: "It often dresses up as anger because anger feels stronger than pain.",
    steps: ["Name what actually hurt.", "Decide what needs saying, and to whom.", "Say it clean, without the ammo."],
  },
  heartbreak: {
    what: "Heartbreak is withdrawal from a person who felt like oxygen.",
    why: "Your brain treats the loss like a chemical crash. The craving to check on them is real and it fades.",
    steps: ["Stop checking their pages today.", "Write the message; don't send it.", "Text someone who has your back."],
  },
  "low mood": {
    what: "Low mood is heaviness that makes everything cost double.",
    why: "Sleep debt, isolation, and stress stack up quietly. The mood is real; its story about you is not.",
    steps: ["Water, shower, or a short walk first.", "Tell one person it's a heavy day.", "Lower the bar and do one small thing."],
  },
  unsafe: {
    what: "This is beyond a rough patch. This needs another human, now.",
    why: "When the mind offers permanent exits to temporary pain, it's overloaded, not truthful.",
    steps: ["Call or text 988 right now.", "Stay with or near someone tonight.", "Remove what could hurt you from reach."],
  },
};

const emotionLabelMap = {
  unsafe: "Unsafe",
  anger: "Anger",
  angry: "Anger",
  sadness: "Sadness",
  sad: "Sadness",
  stress: "Stress",
  stressed: "Stress",
  overwhelm: "Overwhelm",
  overwhelmed: "Overwhelm",
  rumination: "Rumination",
  panic: "Panic",
  panicked: "Panic",
  anxiety: "Anxiety",
  anxious: "Anxiety",
  numbness: "Numbness",
  numb: "Numbness",
  shame: "Shame",
  ashamed: "Shame",
  guilt: "Guilt",
  guilty: "Guilt",
  loneliness: "Loneliness",
  lonely: "Loneliness",
  hurt: "Hurt",
  heartbreak: "Heartbreak",
  "low mood": "Low mood",
  "depressed/down": "Low mood",
  depressed: "Low mood",
  failure: "Shame",
};

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

function moderateText(text) {
  const normalized = String(text || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return { flagged: false };

  const padded = ` ${normalized} `;

  for (const term of bannedTerms) {
    if (term.includes(" ")) {
      if (normalized.includes(term)) return { flagged: true };
    } else if (padded.includes(` ${term} `)) {
      return { flagged: true };
    }
  }

  return { flagged: false };
}

const site = document.querySelector("#site");

window.addEventListener("hashchange", () => {
  state.page = getInitialPage();
  render();
});

function getInitialPage() {
  const page = window.location.hash.replace("#", "");
  return pages.some(([id]) => id === page) ? page : "home";
}

function setPage(page) {
  if (page === "reset") {
    state.activeReset = null;
    state.resetStep = 0;
  }
  state.page = page;
  window.location.hash = page;
  render();
}

function render() {
  site.innerHTML = `
    ${renderHeader()}
    <main>
      ${renderPage()}
    </main>
    ${renderFooter()}
  `;
  bindPageEvents();

  if (state.page === "community" && !state.communityLoaded && !state.communityLoading) {
    loadCommunities();
  }
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-crisis">
        <div>
          <strong>In a bad spot right now?</strong>
          <p>If you're thinking about hurting yourself or someone else, don't wait this one out alone.</p>
        </div>
        <a class="crisis-button" href="tel:988">Call or text 988</a>
      </div>
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="brand-mark">M2M</span>
          <p>Real support for men. No judgment. No bullshit. The place men go before they hit the wall.</p>
        </div>
        <div class="footer-links">
          <span>Tools</span>
          <button data-page="checkin" type="button">Check-In</button>
          <button data-page="reset" type="button">Reset Center</button>
          <button data-page="talk" type="button">Hard Talks</button>
          <button data-page="daily" type="button">Daily</button>
        </div>
        <div class="footer-links">
          <span>People</span>
          <button data-page="community" type="button">Community</button>
          <button data-page="guide" type="button">AI Guide</button>
        </div>
      </div>
      <p class="footer-disclaimer">Man to Man is not therapy and does not replace professional mental health care. If you are in crisis, call or text 988 (US) or your local emergency services.</p>
    </footer>
  `;
}

function renderHeader() {
  return `
    <header class="site-header">
      <button class="brand" data-page="home" type="button">
        <span class="brand-mark">M2M</span>
        <span>Man to Man</span>
      </button>
      <nav class="main-nav" aria-label="Main navigation">
        ${pages
          .map(
            ([id, label]) => `
              <button class="${state.page === id ? "is-active" : ""}" data-page="${id}" type="button">${label}</button>
            `
          )
          .join("")}
      </nav>
    </header>
  `;
}

function renderPage() {
  if (state.page === "checkin") return renderCheckIn();
  if (state.page === "reset") return renderReset();
  if (state.page === "talk") return renderTalk();
  if (state.page === "daily") return renderDaily();
  if (state.page === "community") return renderCommunity();
  if (state.page === "guide") return renderGuide();
  return renderHome();
}

function renderHome() {
  return `
    <section class="hero">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="hero-content">
        <p class="eyebrow">The place men go before they hit the wall</p>
        <h1>Man to Man</h1>
        <p class="hero-copy">
          Real support for men. No judgment. No bullshit. Honest conversations,
          practical tools, and a brotherhood that helps you move forward.
        </p>
        <div class="hero-actions">
          <button class="primary-button" data-page="checkin" type="button">Start a check-in</button>
          <button class="secondary-button" data-page="community" type="button">See the community</button>
        </div>
        <p class="safety-line">Not therapy. Not a replacement for professional mental health care. Crisis support is surfaced when needed.</p>
      </div>
    </section>

    <section class="section-band">
      <div class="section-heading">
        <p class="eyebrow">Mission</p>
        <h2>Help men understand what they are carrying, then take one honest step.</h2>
      </div>
      <div class="benefit-grid">
        ${[
          ["Name it", "Translate rough words into clear labels like Anger, Shame, Stress, Overwhelm, or Rumination."],
          ["Talk it through", "A short AI guide responds in plain language and moves the conversation forward."],
          ["Find men like you", "Anonymous posts and circles create connection without performance."],
          ["Do the next thing", "Reset tools and accountability focus on action, not perfection."],
        ]
          .map(([title, text]) => `<article class="feature-card"><h3>${title}</h3><p>${text}</p></article>`)
          .join("")}
      </div>
    </section>

    <section class="section-band two-column">
      <div>
        <p class="eyebrow">How it works</p>
        <h2>One tight loop.</h2>
        <p class="body-copy">Check in with rough words, get a plain read, run a 10-minute reset, prepare the hard talk, and find men who get it. Action over analysis, every time.</p>
      </div>
      <div class="roadmap-list">
        ${["Check in with rough words", "Get a plain emotion label", "Run a 10-minute reset", "Talk it through with the guide", "Post or join a circle", "Track the basics daily"]
          .map((item, index) => `<div class="roadmap-item"><span>${index + 1}</span><p>${item}</p></div>`)
          .join("")}
      </div>
    </section>

    <section class="section-band">
      <div class="section-heading">
        <p class="eyebrow">What men say</p>
        <h2>Not performing. Just talking.</h2>
      </div>
      <div class="testimonial-grid">
        ${[
          ["\u201CI typed three angry sentences and it named what I couldn't. That alone lowered the temperature.\u201D", "Early tester, 34"],
          ["\u201CNo hype, no shame. It told me to wait 20 minutes before replying to my ex. I did. Glad I did.\u201D", "Early tester, 28"],
          ["\u201CThe circle for fathers is the first place I've said the quiet stuff out loud.\u201D", "Early tester, 41"],
        ]
          .map(
            ([quote, who]) => `
              <figure class="testimonial-card">
                <blockquote>${quote}</blockquote>
                <figcaption>${who}</figcaption>
              </figure>
            `
          )
          .join("")}
      </div>
      <p class="placeholder-note">Placeholder quotes from early testing. Real stories land here as the brotherhood grows.</p>
    </section>

    <section class="section-band">
      <div class="section-heading">
        <p class="eyebrow">Community preview</p>
        <h2>Circles for what you're actually carrying.</h2>
      </div>
      <div class="circle-preview-grid">
        ${starterCircles
          .slice(0, 8)
          .map(
            ([name, blurb]) => `
              <button class="circle-preview" data-page="community" type="button">
                <strong>${name}</strong>
                <p>${blurb}</p>
              </button>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section-band">
      <div class="join-band">
        <div>
          <h2>Stop carrying it alone.</h2>
          <p>Anonymous. Free to start. One honest check-in is enough to begin.</p>
        </div>
        <button class="primary-button" data-page="checkin" type="button">Join with a check-in</button>
      </div>
    </section>
  `;
}

function renderCheckIn() {
  return `
    <section class="workspace">
      <div class="workspace-copy">
        <p class="eyebrow">What's going on?</p>
        <h1>Use your own words.</h1>
        <p>No perfect emotional language needed. Type the rough version, or tap a starting point.</p>
      </div>
      <div class="tool-panel">
        ${state.analysis ? renderDiagnosis() : renderCheckInForm()}
      </div>
    </section>
  `;
}

function renderCheckInForm() {
  return `
    <form class="checkin-form" id="checkin-form">
      <div class="chip-grid">
        ${checkInChips.map((chip) => `<button class="prompt-chip" type="button" data-chip="${escapeHTML(chip)}">${chip}</button>`).join("")}
      </div>
      <label class="visually-hidden" for="entry">Describe what has been happening</label>
      <textarea id="entry" placeholder="Example: I keep snapping at people and then I feel like a failure.">${escapeHTML(state.entry)}</textarea>
      <p class="error-text" id="entry-error"></p>
      <button class="primary-button" type="submit">Name what this is</button>
    </form>
  `;
}

function renderDiagnosis() {
  const labels = displayEmotionWords(state.analysis.emotionWords, state.analysis.emotion);
  return `
    <div class="diagnosis-card ${state.analysis.crisis ? "is-danger" : ""}">
      <p class="eyebrow">What it sounds like</p>
      <h2>${labels.join(" + ")}</h2>
      <p class="tone-line">Guide tone: ${displayTone(state.analysis.tone)}</p>
      <p>${escapeHTML(state.analysis.shortRead)}</p>
      ${
        state.analysis.local
          ? `<p class="local-note">${escapeHTML(state.analysis.apiError?.message || "Local draft. AI guide is unavailable.")}</p>`
          : ""
      }
      ${
        state.analysis.crisis
          ? `<a class="inline-crisis" href="tel:988">${escapeHTML(state.analysis.crisisText || "Call or text 988 now.")}</a>`
          : ""
      }
      ${renderEmotionInsight(state.analysis.emotion)}
      <div class="diagnosis-actions">
        <button class="primary-button" data-page="guide" type="button">Talk it through</button>
        <button class="secondary-button" data-page="reset" type="button">Run a reset</button>
        <button class="secondary-button" id="reset-checkin" type="button">Start over</button>
      </div>
    </div>
  `;
}

function renderEmotionInsight(emotion) {
  const info = emotionLibrary[canonicalEmotion(emotion)];
  if (!info) return "";

  return `
    <div class="insight-grid">
      <div class="insight-block">
        <span>What it is</span>
        <p>${escapeHTML(info.what)}</p>
      </div>
      <div class="insight-block">
        <span>Why it happens</span>
        <p>${escapeHTML(info.why)}</p>
      </div>
      <div class="insight-block">
        <span>Next steps</span>
        <ul>${info.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ul>
      </div>
    </div>
  `;
}

function renderReset() {
  const guide = resetGuides.find((item) => item.id === state.activeReset);
  if (guide) return renderResetGuide(guide);

  return `
    <section class="section-band">
      <div class="section-heading">
        <p class="eyebrow">Reset Center</p>
        <h1>Ten minutes to steady yourself.</h1>
        <p class="body-copy">No lectures. Pick what you're carrying and follow a few short steps. Each one ends with a single thing to actually do.</p>
      </div>
      <div class="reset-grid">
        ${resetGuides
          .map(
            (item) => `
              <button class="reset-card" type="button" data-reset="${escapeHTML(item.id)}">
                <span class="reset-tag">${escapeHTML(item.tag)}</span>
                <strong>${escapeHTML(item.title)}</strong>
                <p>${escapeHTML(item.blurb)}</p>
                <span class="reset-meta">${item.steps.length} steps &middot; ~10 min</span>
              </button>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderResetGuide(guide) {
  const total = guide.steps.length;
  const onAction = state.resetStep >= total;
  const stepIndex = Math.min(state.resetStep, total - 1);

  const dots = guide.steps
    .map((_, index) => `<span class="reset-dot ${onAction || index <= stepIndex ? "is-on" : ""}"></span>`)
    .join("");

  const body = onAction
    ? `
      <div class="reset-action">
        <span class="reset-step-label">One action step</span>
        <h2>${escapeHTML(guide.action)}</h2>
        <div class="reset-nav">
          <button class="secondary-button" data-reset-restart type="button">Run it again</button>
          <button class="primary-button" data-page="guide" type="button">Talk it through</button>
        </div>
      </div>
    `
    : `
      <div class="reset-step">
        <span class="reset-step-label">Step ${stepIndex + 1} of ${total} &middot; ${escapeHTML(guide.steps[stepIndex][1])}</span>
        <h2>${escapeHTML(guide.steps[stepIndex][0])}</h2>
        <p>${escapeHTML(guide.steps[stepIndex][2])}</p>
        <div class="reset-nav">
          ${stepIndex > 0 ? `<button class="secondary-button" data-reset-prev type="button">Back</button>` : ""}
          <button class="primary-button" data-reset-next type="button">${stepIndex === total - 1 ? "See the action step" : "Next"}</button>
        </div>
      </div>
    `;

  return `
    <section class="workspace reset-workspace">
      <div class="workspace-copy">
        <p class="eyebrow">${escapeHTML(guide.tag)} reset</p>
        <h1>${escapeHTML(guide.title)}</h1>
        <p>${escapeHTML(guide.blurb)}</p>
        <button class="secondary-button" data-reset-exit type="button">All resets</button>
      </div>
      <div class="tool-panel reset-panel">
        <div class="reset-progress" aria-hidden="true">${dots}</div>
        ${body}
      </div>
    </section>
  `;
}

const talkPeople = ["Partner", "Ex", "Parent", "Friend", "Boss", "Coworker", "Sibling", "My kid"];

const dailyHabits = [
  ["exercise", "Moved your body"],
  ["sleep", "Slept 7+ hours"],
  ["outside", "Time outside"],
  ["journal", "Wrote something down"],
  ["reachout", "Reached out to a friend"],
  ["honest", "One honest conversation"],
];

const DAILY_KEY = "m2m-daily-v1";

function loadDailyLog() {
  try {
    return JSON.parse(localStorage.getItem(DAILY_KEY)) || {};
  } catch {
    return {};
  }
}

function saveDailyLog(log) {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(log));
  } catch {
    // Private mode or storage full; the day just won't persist.
  }
}

function dateKey(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString().slice(0, 10);
}

function dailyStreak(log) {
  let streak = 0;
  let offset = (log[dateKey(0)] || []).length ? 0 : 1;
  while ((log[dateKey(offset)] || []).length) {
    streak += 1;
    offset += 1;
  }
  return streak;
}

function renderDaily() {
  const log = loadDailyLog();
  const today = log[dateKey(0)] || [];
  const streak = dailyStreak(log);

  const week = Array.from({ length: 7 }, (_, index) => {
    const offset = 6 - index;
    const count = (log[dateKey(offset)] || []).length;
    const label = new Date(Date.now() - offset * 86400000).toLocaleDateString(undefined, { weekday: "narrow" });
    return { count, label, isToday: offset === 0 };
  });

  return `
    <section class="workspace daily-workspace">
      <div class="workspace-copy">
        <p class="eyebrow">Daily accountability</p>
        <h1>Consistency, not perfection.</h1>
        <p>Six basics that keep a man steady. Check what you did today. Missing a day means nothing; quitting the week does.</p>
        <div class="streak-chip">
          <strong>${streak}</strong>
          <span>day streak</span>
        </div>
      </div>
      <div class="tool-panel daily-panel">
        <div class="habit-list">
          ${dailyHabits
            .map(
              ([id, label]) => `
                <button class="habit-row ${today.includes(id) ? "is-done" : ""}" type="button" data-habit="${id}">
                  <span class="habit-check" aria-hidden="true">${today.includes(id) ? "&#10003;" : ""}</span>
                  <span>${label}</span>
                </button>
              `
            )
            .join("")}
        </div>
        <div class="week-strip">
          ${week
            .map(
              (day) => `
                <div class="week-day ${day.isToday ? "is-today" : ""}">
                  <div class="week-bar"><span style="height: ${Math.round((day.count / dailyHabits.length) * 100)}%"></span></div>
                  <small>${escapeHTML(day.label)}</small>
                </div>
              `
            )
            .join("")}
        </div>
        <p class="daily-note">${today.length ? `${today.length} of ${dailyHabits.length} today. ${today.length >= 3 ? "Solid." : "Every check counts."}` : "Nothing checked yet today. Start with the easiest one."}</p>
      </div>
    </section>
  `;
}

function toggleHabit(id) {
  const log = loadDailyLog();
  const key = dateKey(0);
  const today = new Set(log[key] || []);
  if (today.has(id)) {
    today.delete(id);
  } else {
    today.add(id);
  }
  log[key] = [...today];
  saveDailyLog(log);
  render();
}

function renderTalk() {
  return `
    <section class="workspace talk-workspace">
      <div class="workspace-copy">
        <p class="eyebrow">Hard Conversation Builder</p>
        <h1>Say the real thing without blowing it up.</h1>
        <p>Tell it rough. You get an opener, talking points, a short script, and what to do if it gets heated.</p>
      </div>
      <div class="tool-panel">
        ${state.talkLoading ? renderTalkLoading() : state.talkPlan ? renderTalkPlan() : renderTalkForm()}
      </div>
    </section>
  `;
}

function renderTalkForm() {
  return `
    <form class="checkin-form" id="talk-form">
      <div>
        <p class="talk-label">Who is this conversation with?</p>
        <div class="chip-grid">
          ${talkPeople
            .map(
              (person) => `
                <button
                  class="prompt-chip ${state.talkWho === person ? "is-selected" : ""}"
                  type="button"
                  data-talk-who="${escapeHTML(person)}"
                >${person}</button>
              `
            )
            .join("")}
        </div>
      </div>
      <label class="talk-label" for="talk-situation">What's going on?</label>
      <textarea id="talk-situation" placeholder="Example: My dad keeps criticizing how I raise my son and I keep swallowing it, then exploding later."></textarea>
      <label class="talk-label" for="talk-goal">What do you want out of it? (optional)</label>
      <input id="talk-goal" maxlength="300" placeholder="Example: I want him to back off without cutting him out." />
      <p class="error-text" id="talk-error">${escapeHTML(state.talkError)}</p>
      <button class="primary-button" type="submit">Build the conversation</button>
    </form>
  `;
}

function renderTalkLoading() {
  return `
    <div class="loading-inline">
      <span class="loading-dot"></span>
      <p class="eyebrow">Working on it</p>
      <h2>Building your talking points.</h2>
    </div>
  `;
}

function renderTalkPlan() {
  const plan = state.talkPlan;
  const list = (items) =>
    (Array.isArray(items) ? items : [])
      .map((item) => `<li>${escapeHTML(item)}</li>`)
      .join("");

  return `
    <div class="talk-plan">
      <div class="talk-block talk-opener">
        <span class="talk-block-label">Open with this</span>
        <h2>&ldquo;${escapeHTML(plan.opener)}&rdquo;</h2>
      </div>
      <div class="talk-block">
        <span class="talk-block-label">Your talking points</span>
        <ul>${list(plan.points)}</ul>
      </div>
      <div class="talk-block">
        <span class="talk-block-label">A script to lean on</span>
        <ol>${list(plan.script)}</ol>
      </div>
      <div class="talk-columns">
        <div class="talk-block">
          <span class="talk-block-label">If it gets heated</span>
          <ul>${list(plan.ifHeated)}</ul>
        </div>
        <div class="talk-block is-avoid">
          <span class="talk-block-label">Don't say</span>
          <ul>${list(plan.avoid)}</ul>
        </div>
      </div>
      <div class="diagnosis-actions">
        <button class="secondary-button" id="talk-restart" type="button">Build another</button>
        <button class="primary-button" data-page="guide" type="button">Talk it through first</button>
      </div>
    </div>
  `;
}

function renderGuide() {
  return `
    <section class="workspace guide-workspace">
      <div class="workspace-copy">
        <p class="eyebrow">AI Man-to-Man Guide</p>
        <h1>Short replies. Real next steps.</h1>
        <p>The guide names what is happening once, then helps you move: trigger, reaction, meaning, next action.</p>
      </div>
      <div class="tool-panel">
        ${state.analysis ? renderChat() : renderGuideStarter()}
      </div>
    </section>
  `;
}

function renderGuideStarter() {
  return `
    <form class="checkin-form" id="guide-start-form">
      <textarea id="guide-entry" placeholder="Type the rough version here...">${escapeHTML(state.entry)}</textarea>
      <button class="primary-button" type="submit">Start the guide</button>
    </form>
  `;
}

function renderChat() {
  const labels = displayEmotionWords(state.analysis.emotionWords, state.analysis.emotion);
  return `
    <div class="chat-shell">
      <div class="mini-diagnosis">
        <span>What it sounds like</span>
        <strong>${labels.join(" + ")}</strong>
        <em>${displayTone(state.analysis.tone)}</em>
      </div>
      <div class="chat-window" id="chat-window">
        ${state.messages
          .map(
            (message) => `
              <div class="chat-message is-${message.role}">
                <span class="chat-avatar" aria-hidden="true">${message.role === "bot" ? "M2M" : "You"}</span>
                <div class="chat-bubble"><p>${escapeHTML(message.text)}</p></div>
              </div>
            `
          )
          .join("")}
        ${
          state.isThinking
            ? `<div class="chat-message is-bot is-thinking">
                <span class="chat-avatar" aria-hidden="true">M2M</span>
                <div class="chat-bubble"><p>Reading that...</p></div>
              </div>`
            : ""
        }
      </div>
      <form class="chat-form" id="chat-form">
        <textarea id="chat-input" rows="2" placeholder="Reply in your own words..."></textarea>
        <button class="primary-button" type="submit">Send</button>
      </form>
    </div>
  `;
}

function renderCommunity() {
  return `
    <section class="workspace community-workspace">
      <div class="workspace-copy">
        <p class="eyebrow">Brotherhood Community</p>
        <h1>Anonymous, honest, accountable.</h1>
        <p>Men can post what is real, get support, and join circles without turning pain into blame.</p>
      </div>
      <div class="community-layout">
        <div class="community-main">
          ${state.activeCommunityId ? renderPostForm() : renderNoCommunitySelected()}
          ${renderCommunityWarning()}
          <div class="post-list">
            ${renderCommunityStatus()}
            ${renderCommunityPosts()}
          </div>
        </div>
        <aside class="community-side">
          <h2>Create a community</h2>
          <form class="community-form" id="community-form">
            <label class="visually-hidden" for="community-name">Community name</label>
            <input id="community-name" placeholder="Breakups, Anger, Fatherhood..." maxlength="80" />
            <label class="visually-hidden" for="community-description">Community purpose</label>
            <textarea id="community-description" placeholder="What kind of conversations belong here?" maxlength="220"></textarea>
            <button class="primary-button" type="submit">Create community</button>
          </form>
          <h2>Communities</h2>
          ${renderCommunityList()}
          <h2>Start a circle</h2>
          <div class="starter-grid">
            ${starterCircles
              .map(
                ([name]) => `<button class="prompt-chip" type="button" data-starter-circle="${escapeHTML(name)}">${name}</button>`
              )
              .join("")}
          </div>
          <h2>Rules</h2>
          <ul class="rule-list">
            <li>Respect</li>
            <li>Accountability</li>
            <li>No hate or misogyny</li>
            <li>No bullying</li>
            <li>No victim culture</li>
          </ul>
        </aside>
      </div>
    </section>
  `;
}

function renderPostForm() {
  return `
    <form class="post-form" id="post-form">
      <label for="post-text">Post in ${escapeHTML(state.activeCommunityName)}</label>
      <textarea id="post-text" placeholder="Say the real thing. Keep it respectful."></textarea>
      <p class="safety-note">Anonymous. Honest talk welcome. Hate, misogyny, and bullying get flagged.</p>
      <div class="post-actions">
        <span class="active-circle">${escapeHTML(state.activeCommunityName)}</span>
        <button class="primary-button" type="submit">Post</button>
      </div>
    </form>
  `;
}

function renderCommunityWarning() {
  if (!state.communityWarning) return "";
  return `
    <div class="community-warning" role="alert">
      <strong>Hold up</strong>
      <p>${escapeHTML(state.communityWarning)}</p>
    </div>
  `;
}

function renderNoCommunitySelected() {
  return `
    <div class="empty-community">
      <h3>Create or choose a community first.</h3>
      <p>Conversations live inside communities created by the men using the site.</p>
    </div>
  `;
}

function renderCommunityList() {
  if (!state.communities.length && !state.communityLoading) {
    return `<div class="empty-mini">No communities yet. Create the first one.</div>`;
  }

  return `
    <div class="community-list">
      ${state.communities
        .map(
          (community) => `
            <button
              class="${state.activeCommunityId === community.id ? "is-active" : ""}"
              type="button"
              data-community-id="${escapeHTML(community.id)}"
            >
              <strong>${escapeHTML(community.name)}</strong>
              ${community.description ? `<small>${escapeHTML(community.description)}</small>` : ""}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderCommunityStatus() {
  if (state.communityLoading) {
    return `<div class="community-status">Loading community posts...</div>`;
  }

  if (state.communityError) {
    return `<div class="community-status">${escapeHTML(state.communityError)}</div>`;
  }

  return "";
}

function renderCommunityPosts() {
  if (!state.activeCommunityId && !state.communityLoading) {
    return `
      <div class="empty-community">
        <h3>No community selected.</h3>
        <p>Create a community, then start the first conversation inside it.</p>
      </div>
    `;
  }

  if (!state.communityPosts.length && !state.communityLoading) {
    return `
      <div class="empty-community">
        <h3>Start the first conversation in ${escapeHTML(state.activeCommunityName)}.</h3>
        <p>No fake posts. No staged community. Say one honest thing.</p>
      </div>
    `;
  }

  return state.communityPosts
    .map(
      (post) => `
        <article class="post-card">
          <span>${escapeHTML(post.circle)}</span>
          <p>${escapeHTML(post.text)}</p>
          <div class="post-controls">
            <button type="button">Respect</button>
            <button type="button" data-load-replies="${escapeHTML(post.id || "")}">
              ${state.communityReplies[post.id] ? "Refresh conversation" : `Open conversation${post.replies ? ` (${post.replies})` : ""}`}
            </button>
          </div>
          ${renderReplies(post)}
        </article>
      `
    )
    .join("");
}

function renderReplies(post) {
  const replies = state.communityReplies[post.id] || [];

  return `
    <div class="reply-thread">
      ${replies
        .map((reply) => `<div class="reply-card"><p>${escapeHTML(reply.text)}</p></div>`)
        .join("")}
      <form class="reply-form" data-reply-form="${escapeHTML(post.id || "")}">
        <input placeholder="Reply with support, honesty, or a next step..." />
        <button class="secondary-button" type="submit">Reply</button>
      </form>
    </div>
  `;
}

function bindPageEvents() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => setPage(button.dataset.page));
  });

  document.querySelectorAll("[data-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      const textarea = document.querySelector("#entry");
      if (!textarea) return;
      textarea.value = textarea.value.trim() ? `${textarea.value.trim()}\n${button.dataset.chip}` : button.dataset.chip;
      textarea.focus();
    });
  });

  document.querySelectorAll("[data-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeReset = button.dataset.reset;
      state.resetStep = 0;
      render();
    });
  });

  document.querySelector("[data-reset-next]")?.addEventListener("click", () => {
    state.resetStep += 1;
    render();
  });

  document.querySelector("[data-reset-prev]")?.addEventListener("click", () => {
    state.resetStep = Math.max(0, state.resetStep - 1);
    render();
  });

  document.querySelector("[data-reset-restart]")?.addEventListener("click", () => {
    state.resetStep = 0;
    render();
  });

  document.querySelector("[data-reset-exit]")?.addEventListener("click", () => {
    state.activeReset = null;
    state.resetStep = 0;
    render();
  });

  document.querySelectorAll("[data-talk-who]").forEach((button) => {
    button.addEventListener("click", () => {
      state.talkWho = button.dataset.talkWho;
      document.querySelectorAll("[data-talk-who]").forEach((chip) => {
        chip.classList.toggle("is-selected", chip.dataset.talkWho === state.talkWho);
      });
    });
  });

  document.querySelector("#talk-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await buildConversation();
  });

  document.querySelector("#talk-restart")?.addEventListener("click", () => {
    state.talkPlan = null;
    state.talkError = "";
    render();
  });

  document.querySelectorAll("[data-habit]").forEach((button) => {
    button.addEventListener("click", () => toggleHabit(button.dataset.habit));
  });

  document.querySelectorAll("[data-starter-circle]").forEach((button) => {
    button.addEventListener("click", async () => {
      const name = button.dataset.starterCircle;
      const existing = state.communities.find(
        (community) => community.name.toLowerCase() === name.toLowerCase()
      );

      if (existing) {
        state.activeCommunityId = existing.id;
        state.activeCommunityName = existing.name;
        state.communityPosts = [];
        state.communityReplies = {};
        await loadCommunityPosts();
        return;
      }

      const blurb = starterCircles.find(([circleName]) => circleName === name)?.[1] || "";
      await createCommunity({ name, description: blurb });
    });
  });

  document.querySelectorAll("[data-community-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const community = state.communities.find((item) => item.id === button.dataset.communityId);
      if (!community) return;
      state.activeCommunityId = community.id;
      state.activeCommunityName = community.name;
      state.communityPosts = [];
      state.communityReplies = {};
      await loadCommunityPosts();
    });
  });

  document.querySelector("#checkin-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const entry = document.querySelector("#entry").value.trim();
    await startAnalysis(entry, "#entry-error", "checkin");
  });

  document.querySelector("#guide-start-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const entry = document.querySelector("#guide-entry").value.trim();
    await startAnalysis(entry, null, "guide");
  });

  document.querySelector("#reset-checkin")?.addEventListener("click", () => {
    state.entry = "";
    state.analysis = null;
    state.messages = [];
    render();
  });

  document.querySelector("#chat-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await sendChatMessage();
  });

  document.querySelector("#chat-input")?.addEventListener("keydown", async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await sendChatMessage();
    }
  });

  document.querySelector("#post-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = document.querySelector("#post-text").value.trim();
    if (!text) return;
    await createCommunityPost({ text });
  });

  document.querySelector("#community-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.querySelector("#community-name").value.trim();
    const description = document.querySelector("#community-description").value.trim();
    if (!name) return;
    await createCommunity({ name, description });
  });

  document.querySelectorAll("[data-load-replies]").forEach((button) => {
    button.addEventListener("click", async () => {
      const postId = button.dataset.loadReplies;
      if (postId) await loadReplies(postId);
    });
  });

  document.querySelectorAll("[data-reply-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const postId = form.dataset.replyForm;
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (!postId || !text) return;
      input.value = "";
      await createReply(postId, text);
    });
  });

  const chatWindow = document.querySelector("#chat-window");
  if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function loadCommunityPosts() {
  state.communityLoading = true;
  state.communityError = "";
  render();

  try {
    const query = state.activeCommunityId ? `?community_id=${encodeURIComponent(state.activeCommunityId)}` : "";
    const posts = await postJSON(`/api/community-posts${query}`, null, "GET");
    state.communityPosts = posts;
    state.communityLoaded = true;
  } catch (error) {
    state.communityLoaded = true;
    state.communityError =
      error.message || "Community posts will appear here once Supabase is ready.";
  } finally {
    state.communityLoading = false;
    render();
  }
}

async function loadCommunities() {
  state.communityLoading = true;
  state.communityError = "";
  render();

  try {
    const communities = await postJSON("/api/communities", null, "GET");
    state.communities = communities;
    if (!state.activeCommunityId && communities.length) {
      state.activeCommunityId = communities[0].id;
      state.activeCommunityName = communities[0].name;
      await loadCommunityPosts();
      return;
    }
  } catch (error) {
    state.communityError =
      error.message || "Communities will appear here once Supabase is ready.";
  } finally {
    state.communityLoaded = true;
    state.communityLoading = false;
    render();
  }
}

async function createCommunity(community) {
  if (moderateText(`${community.name} ${community.description || ""}`).flagged) {
    showCommunityWarning(COMMUNITY_WARNING);
    return;
  }

  state.communityWarning = "";
  const draft = {
    id: `local-community-${Date.now()}`,
    name: community.name,
    description: community.description || "",
  };
  state.communities.unshift(draft);
  state.activeCommunityId = draft.id;
  state.activeCommunityName = draft.name;
  state.communityPosts = [];
  state.communityReplies = {};
  render();

  try {
    const saved = await postJSON("/api/communities", community);
    state.communities = state.communities.map((item) => (item === draft ? saved : item));
    state.activeCommunityId = saved.id;
    state.activeCommunityName = saved.name;
    state.communityError = "";
  } catch (error) {
    if (error.flagged) {
      state.communities = state.communities.filter((item) => item !== draft);
      state.activeCommunityId = "";
      state.activeCommunityName = "";
      showCommunityWarning(error.message || COMMUNITY_WARNING);
      return;
    }
    state.communityError =
      error.message || "Created locally for now. Supabase is not ready.";
  }

  render();
}

async function createCommunityPost(post) {
  if (moderateText(post.text).flagged) {
    showCommunityWarning(COMMUNITY_WARNING);
    return;
  }

  state.communityWarning = "";
  const draft = {
    id: `local-post-${Date.now()}`,
    communityId: state.activeCommunityId,
    circle: state.activeCommunityName,
    text: post.text,
    replies: 0,
  };
  state.communityPosts.unshift(draft);
  render();

  try {
    const savedPost = await postJSON("/api/community-posts", {
      communityId: state.activeCommunityId,
      circle: state.activeCommunityName,
      text: post.text,
    });
    state.communityPosts = state.communityPosts.map((item) => (item === draft ? savedPost : item));
    state.communityError = "";
  } catch (error) {
    if (error.flagged) {
      state.communityPosts = state.communityPosts.filter((item) => item !== draft);
      showCommunityWarning(error.message || COMMUNITY_WARNING);
      return;
    }
    state.communityError =
      error.message || "Saved locally for now. Supabase is not ready.";
  }

  render();
}

async function loadReplies(postId) {
  if (postId.startsWith("local-post-")) {
    state.communityReplies[postId] = state.communityReplies[postId] || [];
    render();
    return;
  }

  try {
    state.communityReplies[postId] = await postJSON(
      `/api/community-posts/${encodeURIComponent(postId)}/replies`,
      null,
      "GET"
    );
  } catch (error) {
    state.communityError = error.message || "Could not load replies.";
  }

  render();
}

async function createReply(postId, text) {
  if (moderateText(text).flagged) {
    showCommunityWarning(COMMUNITY_WARNING);
    return;
  }

  state.communityWarning = "";
  const draft = { id: `local-reply-${Date.now()}`, postId, text };
  state.communityReplies[postId] = [...(state.communityReplies[postId] || []), draft];
  state.communityPosts = incrementReplyCount(postId);
  render();

  if (postId.startsWith("local-post-")) return;

  try {
    const saved = await postJSON(`/api/community-posts/${encodeURIComponent(postId)}/replies`, { text });
    state.communityReplies[postId] = state.communityReplies[postId].map((item) =>
      item === draft ? saved : item
    );
    state.communityError = "";
  } catch (error) {
    if (error.flagged) {
      state.communityReplies[postId] = (state.communityReplies[postId] || []).filter((item) => item !== draft);
      state.communityPosts = decrementReplyCount(postId);
      showCommunityWarning(error.message || COMMUNITY_WARNING);
      return;
    }
    state.communityError = error.message || "Saved locally for now. Supabase is not ready.";
  }

  render();
}

function showCommunityWarning(message) {
  state.communityWarning = message;
  state.communityError = "";
  render();
}

function incrementReplyCount(postId) {
  return state.communityPosts.map((post) =>
    post.id === postId ? { ...post, replies: Number(post.replies || 0) + 1 } : post
  );
}

function decrementReplyCount(postId) {
  return state.communityPosts.map((post) =>
    post.id === postId ? { ...post, replies: Math.max(0, Number(post.replies || 0) - 1) } : post
  );
}

async function startAnalysis(entry, errorSelector, pageAfter) {
  if (entry.split(/\s+/).filter(Boolean).length < 3) {
    const error = errorSelector ? document.querySelector(errorSelector) : null;
    if (error) error.textContent = "Give it a few more words. Rough is fine.";
    return;
  }

  state.entry = entry;
  state.analysis = null;
  state.messages = [];
  renderLoading(pageAfter);
  state.analysis = await analyzeEntry(entry);
  state.messages = [{ role: "bot", text: state.analysis.opener }];
  state.page = pageAfter;
  render();
}

function renderLoading(page) {
  state.page = page;
  site.innerHTML = `
    ${renderHeader()}
    <main>
      <section class="loading-section">
        <span class="loading-dot"></span>
        <p class="eyebrow">Reading it</p>
        <h1>Naming what this might be.</h1>
      </section>
    </main>
  `;
}

async function analyzeEntry(entry) {
  try {
    const result = await postJSON("/api/analyze", { entry });
    if (result?.emotion && result?.shortRead && result?.opener) {
      const emotion = canonicalEmotion(result.emotion);
      return {
        emotion,
        emotionWords: displayEmotionWords(result.emotionWords, emotion),
        intensity: result.intensity || "medium",
        shortRead: result.shortRead,
        keyPhrase: result.keyPhrase || "",
        tone: result.tone || "steady",
        opener: result.opener,
        crisis: Boolean(result.crisis),
        crisisText: result.crisisText || "",
      };
    }
  } catch (error) {
    const fallback = localAnalyze(entry);
    fallback.local = true;
    fallback.apiError = error.apiError || {
      message: error.message || "AI guide is unavailable, so this is using the local draft.",
    };
    return fallback;
  }

  return { ...localAnalyze(entry), local: true };
}

async function buildConversation() {
  const situation = document.querySelector("#talk-situation")?.value.trim() || "";
  const goal = document.querySelector("#talk-goal")?.value.trim() || "";

  if (!state.talkWho) {
    state.talkError = "Pick who the conversation is with.";
    render();
    return;
  }

  if (situation.split(/\s+/).filter(Boolean).length < 4) {
    state.talkError = "Give a few more words about what's going on.";
    render();
    return;
  }

  state.talkError = "";
  state.talkLoading = true;
  render();

  try {
    const plan = await postJSON("/api/conversation", { who: state.talkWho, situation, goal });
    if (!plan?.opener) throw new Error("The builder came back empty. Try again.");
    state.talkPlan = plan;
  } catch (error) {
    state.talkError = error.message || "Could not build the conversation. Try again.";
  } finally {
    state.talkLoading = false;
    render();
  }
}

async function sendChatMessage() {
  const input = document.querySelector("#chat-input");
  const message = input?.value.trim();
  if (!message || state.isThinking) return;

  state.messages.push({ role: "user", text: message });
  input.value = "";
  state.isThinking = true;
  render();

  let result;
  try {
    result = await postJSON("/api/chat", {
      entry: state.entry,
      analysis: state.analysis,
      messages: state.messages,
    });
  } catch (error) {
    result = { ...localChatReply(message), local: true };
    state.analysis.apiError = error.apiError || (error.message ? { message: error.message } : state.analysis.apiError);
  }

  if (isRepeatedReply(result?.reply)) {
    result = { ...localChatReply(message), local: result?.local || false };
  }

  if (result?.emotion) {
    const emotion = canonicalEmotion(result.emotion);
    if (emotion !== state.analysis.emotion) {
      state.analysis.emotion = emotion;
      state.analysis.emotionWords = displayEmotionWords([emotion], emotion);
    }
  }

  state.messages.push({ role: "bot", text: result?.reply || "Say one more sentence about that." });
  if (result?.crisis) {
    state.analysis.crisis = true;
    state.analysis.crisisText = result.crisisText || state.analysis.crisisText;
  }

  state.isThinking = false;
  render();
}

async function postJSON(path, payload, method = "POST") {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result?.apiError?.message || result?.message || "Request failed.");
    error.apiError = result?.apiError || null;
    error.flagged = result?.error === "content_flagged";
    throw error;
  }

  return result;
}

function localAnalyze(entry) {
  const scores = scoreEntry(entry);
  const topSignals = getTopSignals(scores);
  const emotion = topSignals[0] || "stress";
  const [shortRead, opener] = localReads[emotion] || localReads.stress;
  const keyPhrase = extractKeyPhrase(entry);

  return {
    emotion,
    emotionWords: displayEmotionWords(topSignals.length ? topSignals : [emotion], emotion),
    intensity: scores.unsafe ? "high" : "medium",
    shortRead,
    keyPhrase,
    tone: toneByEmotion[emotion] || "steady",
    opener: keyPhrase ? `"${keyPhrase}" is the clue. ${opener}` : opener,
    crisis: emotion === "unsafe",
    crisisText: emotion === "unsafe" ? "Call or text 988 now, or emergency services if there is immediate danger." : "",
  };
}

function localChatReply(message) {
  const emotion = canonicalEmotion(state.analysis?.emotion || "stress");
  const userTurnCount = state.messages.filter((item) => item.role === "user").length;

  if (localAnalyze(message).crisis) {
    return {
      reply: "Are you safe right now? Call or text 988 now.",
      emotion: "unsafe",
      crisis: true,
      crisisText: "Call or text 988 now, or emergency services if there is immediate danger.",
    };
  }

  const replies = {
    anger: ["Slow it down first. What line got stepped on?", "Do not react yet. What did you want to do?", "What truth needs a cleaner version?", "What would handling this calmly look like today?"],
    panic: ["Start with the body. What is it doing right now?", "What is your mind predicting?", "Exhale slowly six times. What changed?", "What is the next one thing in front of you?"],
    anxiety: ["Name the prediction. What is your mind warning you about?", "What are you trying to prevent?", "What can you control in the next ten minutes?", "What is the next one thing in front of you?"],
    sadness: ["This hurts, but it can move. What part keeps replaying?", "What do you wish was different?", "Who can hear one honest sentence?", "What would be kind to do tonight?"],
    heartbreak: ["This is painful, not permanent. What keeps replaying?", "What do you want from them right now?", "Write the message. Wait twenty minutes.", "What would protect your dignity tonight?"],
    "low mood": ["Heavy days still count. How long has it been this heavy?", "What got harder today?", "Water, shower, or walk first?", "Who can you tell: 'I'm not good today'?"],
    numbness: ["When did you go quiet?", "What have you stopped doing?", "Which small physical thing can you do now?", "What would make the next hour less stuck?"],
    shame: ["What actually happened?", "What are you calling yourself?", "What is one fact, not punishment?", "Is there a repair to make?"],
    guilt: ["What actually happened?", "Is there a repair to make?", "What is one clean apology or action?", "What part is punishment, not repair?"],
    loneliness: ["You do not have to fix it alone. Who do you wish understood?", "Are you avoiding people, or feeling unwanted?", "Who is safest to text one honest sentence?", "What would connection look like without performing?"],
    overwhelm: ["Bring it down to one thing. What is the loudest pressure?", "What can wait?", "Name the next small task.", "What is one thing you can drop today?"],
    rumination: ["The loop wants certainty. What thought keeps repeating?", "What answer are you trying to get?", "Write the loop once. Then pause it.", "What action would end the loop for now?"],
    stress: ["Narrow it down. What needs attention first?", "What are you carrying alone?", "Name the next small task.", "What can wait until tomorrow?"],
  };

  const options = replies[emotion] || ["Say one more sentence about that."];
  return {
    reply: options[Math.min(userTurnCount - 1, options.length - 1)],
    emotion,
    crisis: false,
    crisisText: "",
  };
}

function scoreEntry(text) {
  const normalized = normalize(text);
  const scores = {};
  Object.entries(patterns).forEach(([emotion, words]) => {
    scores[emotion] = words.reduce((count, word) => (normalized.includes(word) ? count + 1 : count), 0);
  });
  return scores;
}

function getTopSignals(scores) {
  const sorted = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion]) => emotion);
  return sorted.includes("unsafe") ? ["unsafe"] : sorted.slice(0, 3);
}

function canonicalEmotion(value) {
  const key = normalize(value || "").replace(/[_-]/g, " ").trim();
  const label = emotionLabelMap[key];
  return label ? label.toLowerCase() : key || "stress";
}

function displayEmotion(value) {
  const key = normalize(value || "").replace(/[_-]/g, " ").trim();
  return emotionLabelMap[key] || titleCase(key || "Stress");
}

function displayEmotionWords(words, fallback) {
  const source = Array.isArray(words) && words.length ? words : [fallback || "stress"];
  return [...new Set(source.map(displayEmotion).filter(Boolean))].slice(0, 3);
}

function displayTone(tone) {
  const key = normalize(tone || "").trim();
  return toneLabelMap[key] || "Steady";
}

function extractKeyPhrase(text) {
  const clean = String(text || "").replace(/\s+/g, " ").replace(/[.!?]+$/g, "").trim();
  if (!clean) return "";
  const clauses = clean
    .split(/\b(?:and|but|because|when|then|so)\b|[,.;:]/i)
    .map((part) => part.trim())
    .filter(Boolean)
    .sort((a, b) => scorePhrase(b) - scorePhrase(a));
  return (clauses[0] || clean).split(/\s+/).slice(0, 8).join(" ");
}

function scorePhrase(phrase) {
  const lower = normalize(phrase);
  let score = Math.min(phrase.length, 80) / 10;
  Object.values(patterns).flat().forEach((word) => {
    if (lower.includes(word)) score += 6;
  });
  return score;
}

function isRepeatedReply(reply) {
  const cleanReply = simplifyReply(reply);
  if (!cleanReply) return true;
  const botReplies = state.messages.filter((message) => message.role === "bot").map((message) => simplifyReply(message.text));
  return botReplies.some((botReply) => botReply === cleanReply || similarity(botReply, cleanReply) > 0.72);
}

function similarity(a, b) {
  const aWords = new Set(a.split(" ").filter((word) => word.length > 2));
  const bWords = new Set(b.split(" ").filter((word) => word.length > 2));
  const allWords = new Set([...aWords, ...bWords]);
  const sharedWords = [...aWords].filter((word) => bWords.has(word));
  return allWords.size ? sharedWords.length / allWords.size : 0;
}

function simplifyReply(text) {
  return String(text || "").toLowerCase().replace(/["'.,?!:;—-]/g, " ").replace(/\s+/g, " ").trim();
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[’]/g, "'");
}

function titleCase(value) {
  return String(value)
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

render();
