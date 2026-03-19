import { useState, useEffect, useRef } from 'react'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const HAS_KEY = GEMINI_KEY && GEMINI_KEY !== 'your_api_key_here'

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.'
}

const JOB_NEWS = {
  developer: [
    { emoji: '⚡', source: 'TechCrunch', headline: 'React 19 brings revolutionary concurrent features to production apps', time: '2h ago', tag: 'Frontend' },
    { emoji: '🤖', source: 'GitHub Blog', headline: 'GitHub Copilot now supports 15 new programming languages', time: '4h ago', tag: 'AI Tools' },
    { emoji: '🔐', source: 'Security Week', headline: 'Critical zero-day vulnerability patched in Node.js runtime', time: '6h ago', tag: 'Security' },
    { emoji: '☁️', source: 'AWS Blog', headline: 'AWS Lambda now supports 10GB memory allocation for intensive workloads', time: '1d ago', tag: 'Cloud' },
    { emoji: '🦀', source: 'The Register', headline: 'Rust becomes second official language for Linux kernel development', time: '1d ago', tag: 'Systems' },
  ],
  designer: [
    { emoji: '🎨', source: 'Figma Blog', headline: 'Figma launches AI-powered design assistant for component generation', time: '1h ago', tag: 'Tools' },
    { emoji: '✨', source: 'Design Week', headline: 'Apple announces new Human Interface Guidelines for vision computing', time: '3h ago', tag: 'HIG' },
    { emoji: '🖼️', source: 'Adobe', headline: 'Adobe Firefly v3 generates print-ready assets from text prompts', time: '5h ago', tag: 'AI' },
    { emoji: '🌈', source: 'CSS-Tricks', headline: 'CSS container queries are now supported in all major browsers', time: '1d ago', tag: 'CSS' },
    { emoji: '📱', source: 'UX Collective', headline: 'Study reveals micro-animations increase user retention by 23%', time: '2d ago', tag: 'Research' },
  ],
  marketer: [
    { emoji: '📈', source: 'Marketing Week', headline: 'Q1 2026 digital ad spend surges 18% year-over-year globally', time: '2h ago', tag: 'Trends' },
    { emoji: '🤖', source: 'HubSpot', headline: 'AI-powered email personalisation drives 45% higher open rates', time: '4h ago', tag: 'Email' },
    { emoji: '📱', source: 'Social Media Today', headline: 'Instagram drops new creator monetisation tools ahead of Q2', time: '6h ago', tag: 'Social' },
    { emoji: '🎯', source: 'AdAge', headline: 'Google phases out third-party cookies—what marketers must do now', time: '1d ago', tag: 'Privacy' },
    { emoji: '🔍', source: 'Search Engine Journal', headline: 'Core Web Vitals update rolling out: page experience signals shift', time: '1d ago', tag: 'SEO' },
  ],
  lawyer: [
    { emoji: '⚖️', source: 'Law360', headline: 'Supreme Court rules on landmark data privacy case, reshaping digital law', time: '1h ago', tag: 'Privacy' },
    { emoji: '🤖', source: 'Legal Tech News', headline: 'Thomson Reuters launches AI contract review for M&A due diligence', time: '3h ago', tag: 'LegalTech' },
    { emoji: '🇪🇺', source: 'Euractiv', headline: 'EU AI Act enforcement begins — compliance checklist for law firms', time: '5h ago', tag: 'Regulation' },
    { emoji: '💼', source: 'American Lawyer', headline: 'Big Law firms see 30% surge in AI governance practice groups', time: '1d ago', tag: 'Practice' },
    { emoji: '🔏', source: 'IP Watchdog', headline: 'Federal Circuit clarifies patent eligibility for AI-generated inventions', time: '2d ago', tag: 'IP' },
  ],
  doctor: [
    { emoji: '🧬', source: 'NEJM', headline: 'mRNA vaccine platform shows 94% efficacy against novel influenza strain', time: '2h ago', tag: 'Vaccines' },
    { emoji: '🤖', source: 'JAMA', headline: 'AI model outperforms radiologists in early-stage lung cancer detection', time: '4h ago', tag: 'Diagnostics' },
    { emoji: '💊', source: 'FDA News', headline: 'FDA approves first oral GLP-1 agonist for type 2 diabetes management', time: '6h ago', tag: 'Approval' },
    { emoji: '🧠', source: 'Nature Medicine', headline: 'Breakthrough in Alzheimer\'s biomarker detection via blood test', time: '1d ago', tag: 'Research' },
    { emoji: '💉', source: 'WHO', headline: 'WHO recommends updated malaria vaccine protocol for sub-Saharan Africa', time: '2d ago', tag: 'Global Health' },
  ],
  default: [
    { emoji: '💡', source: 'Forbes', headline: 'The 10 workplace productivity trends shaping 2026', time: '2h ago', tag: 'Productivity' },
    { emoji: '🤖', source: 'MIT Tech Review', headline: 'Generative AI enters the workplace: opportunities and risks', time: '4h ago', tag: 'AI' },
    { emoji: '📊', source: 'McKinsey', headline: 'Remote and hybrid work: new data on performance and wellbeing', time: '6h ago', tag: 'Work' },
    { emoji: '🌍', source: 'World Economic Forum', headline: 'Future of Jobs 2026: skills that will matter most', time: '1d ago', tag: 'Careers' },
    { emoji: '🔋', source: 'HBR', headline: 'Four science-backed ways to recover from meeting fatigue', time: '1d ago', tag: 'Wellbeing' },
  ],
}

const JOB_PROMPTS = {
  developer: ['Debug this error for me', 'Explain async/await', 'Review my code', 'Best practices for REST APIs'],
  designer: ['Suggest a colour palette', 'Critique this layout', 'UX tips for mobile', 'Font pairing ideas'],
  marketer: ['Write email subject lines', 'Analyse campaign metrics', 'Content calendar ideas', 'SEO checklist'],
  lawyer: ['Summarise this clause', 'Draft a non-disclosure clause', 'Case research tips', 'Contract red flags'],
  doctor: ['Drug interaction check', 'Summarise clinical trial', 'Patient communication tips', 'Differential diagnosis'],
  teacher: ['Lesson plan ideas', 'Student engagement tips', 'Assessment rubric', 'Differentiation strategies'],
  accountant: ['Explain tax implication', 'Month-end checklist', 'Audit prep tips', 'Financial ratio analysis'],
  manager: ['Team OKR template', 'Performance review tips', 'Conflict resolution guide', 'Meeting agenda'],
  journalist: ['Interview question ideas', 'Fact-check sources', 'Story angle suggestions', 'Headline brainstorm'],
  researcher: ['Literature review tips', 'Statistical analysis help', 'Hypothesis refinement', 'Citation formatting'],
  sales: ['Objection handling tips', 'Cold outreach script', 'CRM best practices', 'Closing techniques'],
  engineer: ['System design review', 'Safety checklist', 'Technical specification', 'Load calculation help'],
  default: ['What should I focus on today?', 'Help me prioritise tasks', 'Summarise my notes', 'Daily standup ideas'],
}

// Direct-answer response engine — gives real information, not just tips
const DIRECT_ANSWERS = [
  // === TECH / DEVELOPER ===
  {
    match: (t) => /what is react/i.test(t),
    answer: () => `**React** is a JavaScript library for building user interfaces, created by Meta.\n\nHere's what makes it work:\n• **Components** — reusable UI building blocks (functions that return HTML-like JSX)\n• **State** — data that changes over time, managed with \`useState\`\n• **Props** — data passed from a parent component to a child\n• **Virtual DOM** — React keeps a lightweight copy of the DOM and only updates what changed, making it fast\n\nExample:\n\`\`\`\nfunction Button({ label }) {\n  return <button>{label}</button>\n}\n\`\`\`\n\nReact is used by Facebook, Instagram, Netflix, and thousands of apps worldwide.`,
  },
  {
    match: (t) => /what is (a )?hook/i.test(t) || /react hook/i.test(t),
    answer: () => `**React Hooks** are functions that let you use state and other React features inside function components.\n\nThe most common ones:\n• \`useState\` — stores and updates a value: \`const [count, setCount] = useState(0)\`\n• \`useEffect\` — runs code when something changes (like fetching data on load)\n• \`useRef\` — holds a mutable value that doesn't cause a re-render\n• \`useContext\` — reads from a shared context without prop drilling\n• \`useMemo / useCallback\` — memoize expensive calculations or functions\n\nHooks were added in React 16.8 and replaced class components for most use cases.`,
  },
  {
    match: (t) => /async.?await|what is async/i.test(t),
    answer: () => `**async/await** is JavaScript's way of handling asynchronous code (like API calls) without messy callback chains.\n\n**How it works:**\n• Mark a function \`async\` and it automatically returns a Promise\n• Use \`await\` inside to pause until a Promise resolves\n\n**Example:**\n\`\`\`\nasync function getUser() {\n  const res = await fetch('/api/user')\n  const data = await res.json()\n  return data\n}\n\`\`\`\n\nWithout async/await you'd write \`.then().then().catch()\` chains which are harder to read. Always wrap \`await\` calls in \`try/catch\` to handle errors.`,
  },
  {
    match: (t) => /what is (a )?rest api|rest api/i.test(t),
    answer: () => `A **REST API** (Representational State Transfer) is a standard way for apps to communicate over HTTP.\n\n**The core idea:** everything is a "resource" with a URL, and you use HTTP methods to interact:\n• \`GET /users\` → fetch all users\n• \`GET /users/42\` → fetch user #42\n• \`POST /users\` → create a new user\n• \`PUT /users/42\` → update user #42\n• \`DELETE /users/42\` → delete user #42\n\n**Rules of REST:**\n• Stateless — each request has all the info needed\n• JSON is the standard data format\n• Responses include HTTP status codes (200, 404, 500, etc.)\n\nFor example, when Leo loads your profile, it would call something like \`GET /api/profile\`.`,
  },
  {
    match: (t) => /what is git|how does git work/i.test(t),
    answer: () => `**Git** is a version control system — it tracks every change you make to your code over time.\n\n**Core concepts:**\n• **Repository (repo)** — your project folder tracked by Git\n• **Commit** — a snapshot of your code at a point in time\n• **Branch** — a separate line of development (e.g. \`feature/login\`)\n• **Merge** — combining a branch back into main\n• **Pull Request (PR)** — a request to merge your branch (reviewed by teammates)\n\n**Most-used commands:**\n\`\`\`\ngit init          # start a repo\ngit add .         # stage changes\ngit commit -m ""  # save a snapshot\ngit push          # upload to GitHub\ngit pull          # download latest changes\ngit branch new-feature  # create a branch\n\`\`\`\n\nGitHub, GitLab, and Bitbucket host Git repos online.`,
  },
  {
    match: (t) => /what is python|why use python/i.test(t),
    answer: () => `**Python** is a high-level, general-purpose programming language known for its readable, almost-English syntax.\n\n**Why it's popular:**\n• Easy to learn — minimal boilerplate, no semicolons or curly braces\n• Huge ecosystem — libraries for everything: AI (TensorFlow, PyTorch), data (Pandas, NumPy), web (Django, FastAPI)\n• Used in data science, ML, scripting, automation, and backend development\n\n**Quick example:**\n\`\`\`\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Leo"))  # Hello, Leo!\n\`\`\`\n\nPython is the #1 language for data science and AI. It's also great for beginners.`,
  },
  {
    match: (t) => /what is (a )?bug|debugging/i.test(t),
    answer: () => `A **bug** is any unintended behaviour in your code — it does something you didn't want, or doesn't do something you expected.\n\n**How to debug effectively:**\n1. **Reproduce it** — find the exact steps that cause the bug\n2. **Read the error** — the stack trace usually tells you exactly where it broke\n3. **Isolate** — narrow down which part of the code is responsible\n4. **Console.log / print** — add logging around the suspect area\n5. **Use a debugger** — browser DevTools or an IDE debugger lets you step through code line by line\n6. **Check your assumptions** — the bug is often in what you "thought you knew"\n7. **Fix, then write a test** — so it can't silently come back\n\nThe most common bugs: typos, off-by-one errors, null/undefined values, and async timing issues.`,
  },
  {
    match: (t) => /what is sql|what is a database/i.test(t),
    answer: () => `**SQL** (Structured Query Language) is the language used to interact with relational databases.\n\n**A database** stores data in tables (like spreadsheets), and SQL lets you query and modify that data.\n\n**Common commands:**\n\`\`\`\nSELECT * FROM users WHERE age > 18;\nINSERT INTO users (name, email) VALUES ('Leo', 'leo@example.com');\nUPDATE users SET name = 'Leo AI' WHERE id = 1;\nDELETE FROM users WHERE id = 99;\n\`\`\`\n\nPopular databases: **PostgreSQL** (powerful, open source), **MySQL** (widely used), **SQLite** (lightweight, embedded). Non-relational (NoSQL) alternatives include MongoDB, Firebase, and Redis.`,
  },
  // === DESIGN ===
  {
    match: (t) => /what is figma/i.test(t),
    answer: () => `**Figma** is a browser-based UI/UX design tool used by designers to create, prototype, and collaborate on interfaces.\n\n**Key features:**\n• **Frames** — artboards for screens (desktop, mobile, tablet)\n• **Components** — reusable design elements (like code components)\n• **Auto Layout** — responsive framing that stretches like CSS flexbox\n• **Prototype mode** — link screens to simulate user flows without code\n• **Dev Mode** — shows developers CSS values, spacing, and assets\n• **Real-time collaboration** — multiple people edit the same file simultaneously\n\nFigma became the industry standard after Adobe acquired Sketch's momentum. Plans: free tier, then $15/editor/month for paid.`,
  },
  {
    match: (t) => /font|typography/i.test(t),
    answer: () => `**Typography** is one of the highest-impact design decisions. Here's what actually matters:\n\n**Choosing a font pairing:**\n• Pair a **sans-serif** for body text (Inter, Roboto, DM Sans) with a **display font** for headings (Space Grotesk, Fraunces, Clash Display)\n• Contrast weight or style — don't pair two similar fonts\n\n**Sizing scale (use a ratio like 1.25×):**\n• Body: 14–16px\n• Subheading: 18–20px\n• Heading: 24–32px\n• Display: 40px+\n\n**Readability rules:**\n• Line height: 1.5–1.7× for body text\n• Max line length: 60–75 characters\n• Don't use pure black (#000) on white — it's too harsh; use #1a1a1a\n\nGoogle Fonts is free. Use [fonts.google.com](https://fonts.google.com) to preview pairings.`,
  },
  {
    match: (t) => /color|colour|palette/i.test(t),
    answer: () => `**Colour in design** — here's the real practical knowledge:\n\n**60-30-10 rule:**\n• 60% — dominant colour (background, neutral)\n• 30% — secondary colour (cards, sections)\n• 10% — accent colour (buttons, highlights)\n\n**Colour modes:**\n• Use **HSL** for programmatic colours — easier to create consistent palettes\n• Avoid pure #000 black and #fff white — they feel harsh\n• Dark mode: backgrounds like #0f1117 or #1a1a2e work better than pure black\n\n**Accessibility:**\n• Text must have at least **4.5:1 contrast ratio** against its background (WCAG AA standard)\n• Use [coolors.co](https://coolors.co) or [palettte.app](https://palettte.app) to generate palettes\n• Test colour-blindness with tools like [color-blindness.com](https://color-blindness.com)\n\nWhat kind of palette are you building — dark mode, brand, or UI?`,
  },
  // === GENERAL KNOWLEDGE ===
  {
    match: (t) => /how much water|should i drink/i.test(t),
    answer: () => `The standard recommendation is **2–3 litres (8–10 cups) of water per day** for adults, but it depends on your body size, activity level, and climate.\n\n**Practical tips:**\n• A good rule: drink enough so your urine is pale yellow\n• Drink a glass first thing in the morning — you wake up mildly dehydrated\n• Eat water-rich foods (cucumber, watermelon, oranges) — they count\n• Increase intake if you exercise, it's hot, or you drink a lot of caffeine\n• Coffee and tea (despite myths) do count toward hydration — just not as efficiently as water\n\nDehydration symptoms: headache, fatigue, poor concentration — things that hit hard during a workday.`,
  },
  {
    match: (t) => /how.*(sleep|rest)|sleep.*(hours|need)/i.test(t),
    answer: () => `Adults need **7–9 hours of sleep** per night (National Sleep Foundation). Here's what the research shows:\n\n**What happens when you sleep:**\n• Your brain consolidates memories and clears waste products (including proteins linked to Alzheimer's)\n• Growth hormone is released — essential for tissue repair\n• Your immune system recharges\n\n**Sleep quality tips:**\n• Keep a **consistent schedule** — even on weekends (this regulates your circadian rhythm)\n• Avoid screens 30–60 min before bed (blue light suppresses melatonin)\n• Keep your bedroom cool (around 18°C / 65°F is optimal)\n• Avoid alcohol — it fragments sleep in the second half of the night\n• Caffeine has a 5–6 hour half-life, so cut off by 2pm if you sleep at 10pm\n\n6 hours or less consistently cuts cognitive performance as much as pulling an all-nighter.`,
  },
  {
    match: (t) => /what is (machine learning|ml|ai|artificial intelligence)/i.test(t),
    answer: () => `**Machine Learning (ML)** is a branch of AI where systems learn from data to make predictions or decisions — without being explicitly programmed with rules.\n\n**Types of ML:**\n• **Supervised learning** — trained on labelled data (e.g. spam detection: emails labelled "spam" / "not spam")\n• **Unsupervised learning** — finds patterns in unlabelled data (e.g. customer segmentation)\n• **Reinforcement learning** — learns by trial and error with rewards (e.g. game-playing AIs)\n\n**Real examples you use daily:**\n• Gmail spam filter → supervised classification\n• Netflix recommendations → collaborative filtering\n• ChatGPT / Leo → large language model (LLM) trained on text\n• Face unlock on your phone → convolutional neural network\n\n**Key tools:** Python, TensorFlow, PyTorch, scikit-learn, Hugging Face.`,
  },
  {
    match: (t) => /what is (a )?api/i.test(t),
    answer: () => `An **API** (Application Programming Interface) is a contract between two pieces of software — it defines what requests you can make and what responses you'll get back.\n\n**Real-world analogy:** Think of it like a restaurant menu. You (the app) don't go into the kitchen — you give your order (a request) to the waiter (the API), and the kitchen (the server) prepares what you asked for.\n\n**Common examples:**\n• Weather app → calls a weather API to get today's forecast\n• "Sign in with Google" → uses Google's OAuth API\n• Stripe payments → calls Stripe's payments API\n• This app → would call an AI API (like Gemini or OpenAI) to power Leo\n\n**REST APIs** are the most common type, using HTTP and JSON. GraphQL is a popular modern alternative.`,
  },
  {
    match: (t) => /capital of/i.test(t),
    answer: (q) => {
      const countries = {
        france: 'Paris', germany: 'Berlin', japan: 'Tokyo', australia: 'Canberra',
        canada: 'Ottawa', brazil: 'Brasília', india: 'New Delhi', china: 'Beijing',
        italy: 'Rome', spain: 'Madrid', mexico: 'Mexico City', russia: 'Moscow',
        uk: 'London', usa: 'Washington D.C.', 'united states': 'Washington D.C.',
        'south korea': 'Seoul', argentina: 'Buenos Aires', egypt: 'Cairo',
        nigeria: 'Abuja', kenya: 'Nairobi', ghana: 'Accra', sweden: 'Stockholm',
        norway: 'Oslo', denmark: 'Copenhagen', netherlands: 'Amsterdam', portugal: 'Lisbon',
      }
      for (const [country, capital] of Object.entries(countries)) {
        if (q.toLowerCase().includes(country)) {
          return `The capital of **${country.charAt(0).toUpperCase() + country.slice(1)}** is **${capital}**. 🗺️\n\nAnything else you'd like to know?`
        }
      }
      return `I'd need to know the specific country! Ask me something like "What's the capital of France?" and I'll answer directly. 🗺️`
    },
  },
  // === QUICK FACT QUESTIONS ===
  {
    match: (t) => /what time is it|current time/i.test(t),
    answer: () => {
      const now = new Date()
      return `Right now it's **${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}** on ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. ⏰`
    },
  },
  {
    match: (t) => /what.*(date|day) is it|today.*(date|day)/i.test(t),
    answer: () => {
      const now = new Date()
      return `Today is **${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}**. 📅`
    },
  },
  // === WORK TOPICS ===
  {
    match: (t) => /what is (a )?standup/i.test(t),
    answer: () => `A **daily standup** (or "daily scrum") is a short 15-minute team check-in — usually at the start of the workday.\n\n**The classic 3 questions format:**\n1. What did I do yesterday?\n2. What am I doing today?\n3. Is anything blocking me?\n\n**Best practices:**\n• Keep it under 15 minutes — if a topic needs deeper discussion, "take it offline" after\n• Stand up (literally) — it keeps things brief\n• Everyone speaks, including remote team members\n• Focus on blockers — that's the most actionable part\n\nStandups come from Agile/Scrum methodology. Some teams do them async (via Slack or tools like Geekbot) if timezones make live standups hard.`,
  },
  {
    match: (t) => /what is okr/i.test(t),
    answer: () => `**OKRs** (Objectives and Key Results) are a goal-setting framework used by Google, Intel, LinkedIn, and many others.\n\n**Structure:**\n• **Objective** — an inspiring, qualitative goal: *"Become the go-to product for remote teams"*\n• **Key Results** — 3–5 measurable outcomes that prove you hit the objective:\n  → NPS score increases from 42 to 60\n  → Monthly active users grow from 10k to 25k\n  → Churn reduces below 5%\n\n**How it works:**\n• Set OKRs quarterly at company, team, and individual level\n• Rate progress 0–1 at quarter end (0.6–0.7 is considered a success — you should be setting ambitious targets)\n• Purely aspirational — not tied to salary (otherwise people sandbag)\n\nThe book "Measure What Matters" by John Doerr is the definitive guide.`,
  },
  // === GREETINGS / CONVERSATIONAL ===
  {
    match: (t) => /^(hi|hello|hey|hiya|howdy|sup|yo)\b/i.test(t.trim()),
    answer: (_, job) => `Hey! 👋 I'm Leo, your AI assistant. I can answer real questions — try asking me:\n\n• "What is async/await?"\n• "What is a REST API?"\n• "How much sleep do I need?"\n• "What is machine learning?"\n• "What's the capital of Japan?"\n\nOr ask me anything about your **${job}** work!`,
  },
  {
    match: (t) => /thank/i.test(t),
    answer: () => `You're welcome! 😊 Ask me anything — I'm here to give you actual answers, not just advice.`,
  },
  {
    match: (t) => /how are you|how do you feel/i.test(t),
    answer: () => `I'm doing great — ready to answer your questions! 🦁\n\nI work best when you ask me specific things. Try: "What is React?", "How does Git work?", "What's the capital of Brazil?" — I'll give you a real answer, not a list of tips.`,
  },

  // === BROAD TOPIC OVERVIEWS ===
  {
    match: (t) => /\b(about |tell me about |explain |overview of |what is )?\bdesign(s|ing)?\b/i.test(t),
    answer: () => `**Design** is the discipline of solving problems visually and experientially — making things useful, usable, and beautiful.\n\n**The main branches:**\n• **UI Design** (User Interface) — what things look like: layout, colours, typography, components\n• **UX Design** (User Experience) — how things feel to use: flows, interactions, usability\n• **Graphic Design** — visual communication: branding, print, advertising\n• **Product Design** — end-to-end design of digital products, combining UI + UX + strategy\n• **Motion Design** — animations and transitions that guide attention\n\n**Core principles every designer uses:**\n• **Hierarchy** — direct the eye to what matters most first\n• **Contrast** — make important elements stand out\n• **Alignment** — create visual order and tidiness\n• **Proximity** — group related things together\n• **White space** — breathing room makes designs readable and premium\n• **Consistency** — same colours, fonts, and patterns throughout\n\n**The design process:**\n1. Research — understand users and the problem\n2. Define — identify what needs solving\n3. Ideate — sketch many solutions\n4. Prototype — build a testable version\n5. Test — get feedback from real users\n6. Iterate — improve based on findings\n\n**Tools:** Figma (UI/UX, industry standard), Adobe XD, Sketch, Illustrator, Photoshop, Framer (interactive prototyping)\n\nGood design is invisible — you only notice bad design. The best designers focus obsessively on the user's experience, not on making things look fancy.`,
  },
  {
    match: (t) => /\b(about |tell me about |explain |overview of |what is )?\bprogramming\b/i.test(t) && !/what is (a )?bug|debugging/.test(t),
    answer: () => `**Programming** (also called coding or software development) is the process of writing instructions that a computer can execute to perform tasks.\n\n**How it works:**\nComputers only understand 1s and 0s (binary). Programming languages are a human-readable layer that gets translated (compiled or interpreted) into instructions the machine can run.\n\n**Types of programming:**\n• **Frontend** — what users see in a browser (HTML, CSS, JavaScript, React)\n• **Backend** — servers, databases, business logic (Python, Node.js, Go, Java)\n• **Mobile** — apps for iOS (Swift) and Android (Kotlin/Java)\n• **Data Science / ML** — processing data and building AI models (Python, R)\n• **Systems** — low-level, close to hardware (C, C++, Rust)\n• **DevOps** — infrastructure, deployment, automation (Docker, Kubernetes, CI/CD)\n\n**Key concepts:**\n• **Variables** — store data\n• **Functions** — reusable blocks of logic\n• **Loops** — repeat actions\n• **Conditionals** — make decisions (if/else)\n• **Data structures** — organise data (arrays, objects, lists)\n• **Algorithms** — step-by-step procedures to solve problems\n\n**Best languages to start with:**\n• **Python** — simplest syntax, huge community, great for data/AI\n• **JavaScript** — runs in every browser, essential for web\n• **Swift / Kotlin** — if you want to build mobile apps\n\nProgramming is fundamentally about breaking big problems into small, solvable steps. The logic matters more than which language you learn first.`,
  },
  {
    match: (t) => /\b(about |tell me about |explain |overview of |what is )?\bmarketing\b/i.test(t),
    answer: () => `**Marketing** is everything a business does to attract and retain customers — from brand awareness to conversion to loyalty.\n\n**The core marketing mix (4 Ps):**\n• **Product** — what you're selling and how it meets customer needs\n• **Price** — your pricing strategy (premium, competitive, freemium, etc.)\n• **Place** — where and how customers access your product\n• **Promotion** — how you communicate your value (ads, content, PR, social)\n\n**Major channels:**\n• **SEO** — rank higher on Google organically through content and technical optimisation\n• **Paid Ads** — Google Ads, Meta Ads, LinkedIn Ads — pay per click or impression\n• **Email** — one of the highest ROI channels ($36 return for every $1 spent on average)\n• **Social Media** — organic community building on Instagram, LinkedIn, X, TikTok\n• **Content Marketing** — blog posts, videos, podcasts that attract and educate your audience\n• **Influencer** — partnering with people who have your audience's attention\n\n**Key metrics:**\n• **CAC** (Customer Acquisition Cost) — how much it costs to gain one customer\n• **LTV** (Lifetime Value) — total revenue a customer generates over time\n• **CTR** (Click-Through Rate) — % of people who click an ad/email\n• **Conversion Rate** — % of visitors who take a desired action\n• **Churn Rate** — % of customers who stop buying\n\nMarketing's job is to bring the right message to the right person at the right time — with the right cost.`,
  },
  {
    match: (t) => /\b(about |tell me about |explain |overview of |what is )?\bux\b|\buser experience\b/i.test(t),
    answer: () => `**UX (User Experience)** is the practice of making digital products easy, intuitive, and enjoyable to use.\n\n**What UX designers actually do:**\n• **User research** — interviews, surveys, usability tests to understand real users\n• **Personas** — fictional profiles of typical users to design for\n• **User journeys** — mapping the steps a user takes to achieve a goal\n• **Information architecture** — organising content so it's easy to find\n• **Wireframing** — low-fidelity sketches of layouts before adding visual design\n• **Prototyping** — interactive mockups to test before building\n• **Usability testing** — watching real users try to complete tasks\n\n**Key UX laws and principles:**\n• **Fitts's Law** — bigger, closer targets are faster to click\n• **Hick's Law** — more choices = longer decision time (keep menus short)\n• **Jakob's Law** — users spend most time on other sites, so match familiar patterns\n• **Miller's Law** — people can hold ~7 items in working memory\n• **Gestalt principles** — proximity, similarity, continuity shape how we perceive groups\n\n**The difference: UX vs UI**\n• UX = the whole experience (is it useful? easy? enjoyable?)\n• UI = the visual surface (does it look good? are buttons the right size?)\n\nBad UX costs money — 70% of online businesses fail because of poor usability. Good UX pays for itself.`,
  },
  {
    match: (t) => /\b(about |tell me about |explain |overview of |what is )?\bdata science\b/i.test(t),
    answer: () => `**Data Science** is the field of extracting insight and value from data using statistics, programming, and domain knowledge.\n\n**The data science workflow:**\n1. **Collect** — gather data from databases, APIs, surveys, sensors\n2. **Clean** — handle missing values, remove duplicates, fix errors (takes ~80% of time)\n3. **Explore (EDA)** — visualise and understand patterns, distributions, correlations\n4. **Model** — build statistical or machine learning models to predict or explain\n5. **Evaluate** — test accuracy on unseen data\n6. **Deploy** — put the model into production so others can use it\n7. **Monitor** — track performance over time as data drifts\n\n**Core skills:**\n• **Python** — pandas, NumPy, scikit-learn, matplotlib, seaborn\n• **SQL** — query databases\n• **Statistics** — probability, hypothesis testing, regression\n• **Machine Learning** — supervised, unsupervised, neural networks\n• **Communication** — explaining findings to non-technical stakeholders\n\n**Common job titles in the field:**\n• Data Analyst — focuses on reporting and dashboards\n• Data Scientist — builds models and runs experiments\n• ML Engineer — deploys models at scale in production\n• Data Engineer — builds the pipelines that deliver clean data\n\nData science is most impactful when it answers a real business question — not when it's just technically impressive.`,
  },
  {
    match: (t) => /\b(about |tell me about |explain |overview of |what is )?\b(project management|agile|scrum|kanban)\b/i.test(t),
    answer: () => `**Project Management** is the practice of planning, organising, and completing a defined scope of work within time and budget constraints.\n\n**Main methodologies:**\n\n**Waterfall** (traditional)\n• Linear: Requirements → Design → Build → Test → Deploy\n• Best for: fixed-scope projects where requirements are clear upfront (construction, hardware)\n• Weakness: hard to change course mid-project\n\n**Agile** (modern standard for software)\n• Iterative: work in short **sprints** (1–4 weeks), deliver working software frequently\n• Built for: change — requirements evolve as you learn\n• Key values: people over process, working software over documentation, customer collaboration\n\n**Scrum** (most popular Agile framework)\n• **Roles:** Product Owner (defines priorities), Scrum Master (removes blockers), Development Team\n• **Ceremonies:** Sprint Planning → Daily Standup → Sprint Review → Retrospective\n• **Artifacts:** Product Backlog, Sprint Backlog, Increment\n\n**Kanban** (flow-based)\n• Visualise work on a board: To Do → In Progress → Done\n• No fixed sprints — work flows continuously\n• Key metric: cycle time (how long a task takes from start to finish)\n\n**Core PM skills:**\n• Scope management, risk management, stakeholder communication\n• Tools: Jira, Linear, Asana, Notion, Monday.com\n\nThe best PMs are great communicators first, process managers second.`,
  },
  {
    match: (t) => /\b(about |tell me about |explain |overview of |what is )?\b(business|entrepreneur|startup)\b/i.test(t),
    answer: () => `**Business** is the activity of creating, buying, or selling products/services in exchange for money.\n\n**Key business concepts:**\n\n**Revenue models — how businesses make money:**\n• Subscription (SaaS) — recurring monthly/annual fee (Spotify, Netflix, Slack)\n• Transaction — one-time sale (Amazon, Apple Store)\n• Advertising — free product, paid by advertisers (Google, Meta)\n• Marketplace — take a cut of each transaction (Airbnb, Uber, eBay)\n• Freemium — free tier converts to paid (Notion, Figma, Spotify)\n\n**Financial basics:**\n• **Revenue** — money coming in from sales\n• **Cost of Goods Sold (COGS)** — direct costs to deliver your product\n• **Gross Profit** = Revenue − COGS\n• **Operating Expenses** — rent, salaries, marketing, admin\n• **Net Profit (bottom line)** = Gross Profit − Operating Expenses\n• **Burn Rate** — how fast a startup spends cash\n• **Runway** — how long until the money runs out\n\n**Startup stages:**\n• Idea → MVP (Minimum Viable Product) → Product-Market Fit → Scale → Profitability\n\n**Key frameworks:**\n• **Lean Startup** — build → measure → learn, fast iteration\n• **Business Model Canvas** — map your entire business on one page\n• **SWOT Analysis** — Strengths, Weaknesses, Opportunities, Threats\n\nThe most important business skill is understanding your customer better than they understand themselves.`,
  },
]

// Universal smart answer engine — understands question intent for any question
function generateResponse(userText, job, jobKey) {
  // Check direct-answer patterns first (specific knowledge questions)
  for (const item of DIRECT_ANSWERS) {
    if (item.match(userText)) {
      return item.answer(userText, job)
    }
  }

  // Smart universal fallback: parse question intent and give a real on-topic answer
  const t = userText.trim()
  const lower = t.toLowerCase()

  // Extract the main topic — strip common question prefixes
  const topicRaw = t
    .replace(/^(tell me about|what (is|are|do|does|was|were)|how (do|does|can|to|did)|why (is|are|do|does)|explain|describe|give me|show me|can you (explain|tell me)|what's|whats|define|meaning of|overview of|talk about|i want to know about|i need help with|help me with|help me understand)\s+/i, '')
    .replace(/[?!.]+$/, '')
    .trim()
  const topic = topicRaw || t

  const isDiff = /difference|vs\.?\s|versus|compare|better than|or\b/i.test(t)
  const isBest = /\b(best|top|recommend(ed)?|should i use|which (one|should)|good for)\b/i.test(t)
  const isHow = /^how\b/i.test(t)
  const isWhy = /^why\b/i.test(t)
  const isWhat = /^(what|whats|what's)\b/i.test(t)

  if (isDiff) {
    // Try to extract the two things being compared
    const sides = topic.split(/\s+(vs\.?|versus|or|compared to|and)\s+/i).filter(s => !s.match(/^(vs\.?|versus|or|compared|and)$/i))
    const a = sides[0]?.trim() || topic
    const b = sides[1]?.trim()
    if (b) {
      return `**${a} vs ${b}** — here's a direct comparison:\n\n**${a}**\n• More established/suited for: specific use cases, look at official docs\n• Strengths: performance, ecosystem, ease of use depend on the context\n• Best when: you need its primary use case\n\n**${b}**\n• More established/suited for: different use cases or audiences\n• Strengths: may trade some features for simplicity or power\n• Best when: its specific strengths match your need\n\n**My recommendation:** The winner depends on your specific constraint. Tell me more — what are you building, and what matters most (speed to build, performance, learning curve, cost)? I'll give you a direct pick.`
    }
    return `To compare **"${topic}"** properly, I'd need to know both things you're weighing up. Try: "X vs Y" and I'll give you a direct side-by-side breakdown covering: purpose, trade-offs, use cases, and a clear recommendation.`
  }

  if (isBest) {
    return `For **"${topic}"** — here's how to pick the best option:\n\n**Step 1: Define what "best" means for you**\n• Speed to ship? → pick the most popular/documented option\n• Performance? → benchmark with your actual data\n• Long-term maintainability? → pick the one with the most active community\n• Cost? → check pricing at your expected scale\n• Team familiarity? → pick what your team knows\n\n**General top picks by category:**\n• Web frameworks → React (most jobs), Vue (simpler), Next.js (full-stack)\n• Design tools → Figma (industry standard)\n• Databases → PostgreSQL (general), MongoDB (flexible schema), Redis (caching)\n• Project management → Linear (engineering), Notion (general), Jira (enterprise)\n• Communication → Slack (teams), Discord (communities)\n\nTell me specifically what you need "${topic}" for, and I'll give you a single direct recommendation.`
  }

  if (isHow) {
    return `**How to ${topic}** — here's the step-by-step:\n\n1. **Understand the goal** — what does success look like? Define it concretely.\n2. **Research first** — check official docs or authoritative sources before guessing\n3. **Break it into stages** — most tasks have 3–7 sub-steps; identify them before starting\n4. **Start with the simplest version** — get something working, then improve it\n5. **Test as you go** — don't wait until the end to find out something is wrong\n6. **Iterate** — refine based on real results, not assumptions\n\nI can give more detailed, specific steps if you tell me the context — what tool, language, or situation are you working in?`
  }

  if (isWhy) {
    return `**Why ${topic}** — great question to ask. Here's the answer:\n\n**The short reason:** Most "why" questions come down to one of these:\n• It solves a specific problem that existed before it\n• It's a trade-off — gaining something by giving something else up\n• It evolved from historical constraints that no longer exist but the behaviour remains\n• There's a strong incentive (economic, technical, social) driving it\n\n**For "${topic}" specifically:**\nThe honest answer depends on the exact context. Is this a technical "why" (e.g. why does JavaScript do X?), a scientific "why" (why does the body do X?), or a strategic "why" (why do companies do X?)?\n\nAsk me something like: "Why does [specific thing] work this way?" and I'll give you the real reason.`
  }

  if (isWhat) {
    return `**${topic}** is something I can explain! Here's what I know:\n\nThis could refer to a few different things depending on context. Tell me a bit more and I'll give you a precise definition with examples.\n\nI have solid knowledge of:\n• **Tech:** React, Python, Git, databases, APIs, machine learning, cloud, security\n• **Design:** UX, UI, Figma, typography, colour theory, design systems\n• **Business:** marketing, OKRs, startups, revenue models, project management\n• **Science/health:** sleep, nutrition, biology, medicine\n• **General knowledge:** geography, history, economics\n\nWhat specifically about **"${topic}"** do you want to know?`
  }

  // Catch-all: make a genuine attempt based on the topic
  return `I hear you — you're asking about **"${topic}"**. 🦁\n\nHere's what's generally true about most topics in this space:\n• There's almost always an official or authoritative source — look for it first\n• The fundamentals matter more than the trendy details\n• Understanding the "why" behind something makes the "how" much easier to learn\n\nI'm best at answering direct questions. Try one of these formats:\n• **"What is ${topic}?"** → I'll define and explain it\n• **"How does ${topic} work?"** → I'll walk through the mechanics\n• **"Tell me about ${topic}"** → I'll give a full overview\n• **"Best way to do ${topic}"** → I'll give a concrete recommendation\n\nWhat specifically do you want to know?`
}

// For custom jobs, try a loose keyword match against known presets
function resolveJobKey(job) {
  if (!job) return 'default'
  const known = Object.keys(JOB_PROMPTS).filter(k => k !== 'default')
  const lower = job.toLowerCase()
  const match = known.find(k => lower.includes(k) || k.includes(lower))
  return match || 'default'
}

// Render markdown-lite: **bold**, `code`, newlines
function renderText(text) {
  return text.split('\n').map((line, i) => {
    const parts = []
    let remaining = line
    let key = 0
    while (remaining.length > 0) {
      const bold = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s)
      const code = remaining.match(/^(.*?)`([^`]+)`(.*)/s)
      if (bold && (!code || bold[1].length <= (code[1]?.length ?? Infinity))) {
        if (bold[1]) parts.push(<span key={key++}>{bold[1]}</span>)
        parts.push(<strong key={key++} style={{ color: '#f1f5f9', fontWeight: 700 }}>{bold[2]}</strong>)
        remaining = bold[3]
      } else if (code) {
        if (code[1]) parts.push(<span key={key++}>{code[1]}</span>)
        parts.push(<code key={key++} style={{ background: 'rgba(99,102,241,0.18)', color: '#818cf8', padding: '1px 5px', borderRadius: 4, fontSize: '0.9em', fontFamily: 'monospace' }}>{code[2]}</code>)
        remaining = code[3]
      } else {
        parts.push(<span key={key++}>{remaining}</span>)
        break
      }
    }
    return <div key={i} style={{ minHeight: line === '' ? 8 : undefined }}>{parts}</div>
  })
}

export default function AIChat({ profile }) {
  const job = profile?.job || 'default'
  const jobKey = resolveJobKey(job)
  const prompts = JOB_PROMPTS[jobKey]
  const news = JOB_NEWS[jobKey]

  const [messages, setMessages] = useState([
    {
      id: 1, role: 'leo',
      text: `Hey ${profile?.name || 'there'}! 👋 I'm Leo, your AI work assistant. I'm here to help you with your ${job} work. Ask me anything — from quick questions to complex tasks.`
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function sendMessage(text) {
    const txt = (text || input).trim()
    if (!txt) return
    setInput('')
    setMessages(m => [...m, { id: Date.now(), role: 'user', text: txt }])
    setIsTyping(true)

    // Use real Gemini API if a key is configured
    if (HAS_KEY) {
      try {
        const systemPrompt = `You are Leo, an intelligent AI work assistant. The user's name is ${profile?.name || 'there'} and their job is: ${job}. Give concise, direct, genuinely helpful answers. Use ** for bold text and • for bullet points (never use * for bullets). Keep responses focused and practical.`
        const resp = await callGemini(`${systemPrompt}\n\nUser: ${txt}`)
        setMessages(m => [...m, { id: Date.now() + 1, role: 'leo', text: resp }])
        setIsTyping(false)
        return
      } catch (err) {
        console.warn('Gemini API hit a limit or error. Falling back to local offline engine:', err.message)
      }
    }

    // Fallback to local engine if no API key or if API call failed
    setTimeout(() => {
      const resp = generateResponse(txt, job, jobKey)
      setMessages(m => [...m, { id: Date.now() + 1, role: 'leo', text: resp }])
      setIsTyping(false)
    }, 900 + Math.random() * 700)
  }

  return (
    <div className="page anim-fade-in">
      <h1 className="page-title">AI Assistant</h1>
      <p className="page-subtitle">Tailored for <strong>{job}</strong> · Ask me anything</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Chat panel */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {['chat', 'news'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  flex: 1, padding: '14px', background: 'none', fontWeight: 600, fontSize: 13,
                  color: activeTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === t ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.2s', textTransform: 'capitalize'
                }}
              >
                {t === 'chat' ? '💬 Chat' : '📰 Relevant News'}
              </button>
            ))}
          </div>

          {activeTab === 'chat' && (
            <div className="chat-window">
              <div className="chat-messages" role="log" aria-label="Chat messages" aria-live="polite">
                {messages.map(m => (
                  <div key={m.id} className={`msg ${m.role} anim-fade-up`}>
                    <div className="msg-avatar" aria-hidden="true">{m.role === 'leo' ? '🦁' : (profile?.name?.[0] || '?')}</div>
                    <div className="msg-bubble" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                      {m.role === 'leo' ? renderText(m.text) : m.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="msg leo anim-fade-up" aria-live="polite" aria-label="Leo is typing">
                    <div className="msg-avatar" aria-hidden="true">🦁</div>
                    <div className="msg-bubble" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '14px 16px' }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: 'var(--text-muted)',
                          animation: `pulse-rec 1s ${i * 0.2}s ease-in-out infinite`
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="chat-input-bar">
                <input
                  className="chat-input"
                  placeholder={`Ask Leo about your ${job} work…`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  aria-label="Message Leo"
                />
                <button
                  className="btn btn-primary btn-icon"
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  style={{ fontSize: 18, padding: '10px 12px' }}
                >
                  ➤
                </button>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div style={{ padding: 16, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
              <div className="pill pill-purple" style={{ marginBottom: 14 }}>📡 Tailored for {job}</div>
              {news.map((n, i) => (
                <div key={i} className="news-card anim-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="news-thumb" aria-hidden="true">{n.emoji}</div>
                  <div className="news-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span className="news-source">{n.source}</span>
                      <span className="tag">{n.tag}</span>
                    </div>
                    <div className="news-headline">{n.headline}</div>
                    <div className="news-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick prompts sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <span className="card-title">Quick Prompts</span>
              <span className="pill pill-purple" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {prompts.map((p, i) => (
                <button
                  key={i}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', fontSize: 12, textAlign: 'left' }}
                  onClick={() => { setActiveTab('chat'); sendMessage(p) }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Leo can help with</div>
            {['Summarising documents', 'Drafting emails & reports', 'Research & fact-checking', 'Planning your schedule', 'Explaining complex topics'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-4)' }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
