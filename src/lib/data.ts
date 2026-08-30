/* Default portfolio content. Everything here is editable from /admin at runtime. */

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  intro: string;
  location: string;
  email: string;
  statusLine: string;
  githubUsername: string;
  leetcode: string;
  codeforces: string;
  hackerrank: string;
  kaggle: string;
  huggingface: string;
  resumeDataUrl: string;
  resumeUpdated: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  summary: string;
  bullets: string[];
  tech: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  branch: string;
  start: string;
  end: string;
  score: string;
  coursework: string[];
  note: string;
}

export type ProjectCategory =
  | "AI/ML"
  | "GENAI"
  | "COMPUTER VISION"
  | "NLP"
  | "WEB APPS"
  | "DATA SCIENCE"
  | "OTHER";

export const PROJECT_CATEGORIES: Array<ProjectCategory | "ALL"> = [
  "ALL",
  "AI/ML",
  "GENAI",
  "COMPUTER VISION",
  "NLP",
  "WEB APPS",
  "DATA SCIENCE",
  "OTHER",
];

export interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  category: ProjectCategory;
  tech: string[];
  github: string;
  demo: string;
  video: string;
  dataset: string;
  model: string;
  metrics: string[];
  features: string[];
  date: string;
  featured: boolean;
  hidden: boolean;
  image: string;
  architecture: "rag" | "cv" | "nlp" | "data" | "none";
}

export interface CertItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  verifyUrl: string;
  image: string;
}

export interface SkillGroup {
  id: string;
  group: string;
  items: string[];
}

export type LabStatus = "EXPERIMENTAL" | "STABLE" | "ARCHIVED";

export interface LabItem {
  id: string;
  code: string;
  title: string;
  model: string;
  stack: string[];
  status: LabStatus;
  note: string;
  metric: string;
}

export interface AchievementItem {
  id: string;
  year: string;
  kind: string;
  title: string;
  detail: string;
}

export interface SocialItem {
  id: string;
  platform: string;
  username: string;
  url: string;
  note: string;
  enabled: boolean;
}

export interface SiteContent {
  profile: Profile;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certificates: CertItem[];
  skills: SkillGroup[];
  lab: LabItem[];
  achievements: AchievementItem[];
  socials: SocialItem[];
}

export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const DEFAULT_CONTENT: SiteContent = {
  profile: {
    name: "Rahul Verma",
    role: "AI/ML Engineer",
    tagline: "AI/ML Engineer | Generative AI | Computer Vision | NLP",
    intro:
      "Final-year Computer Science engineer focused on building practical AI/ML systems — LLM applications, intelligent APIs and data-driven products that ship to real users, not just notebooks.",
    location: "Bengaluru, India",
    email: "hello@rahul.ai",
    statusLine: "AVAILABLE FOR AI/ML ENGINEERING ROLES",
    githubUsername: "",
    leetcode: "rahul_codes",
    codeforces: "",
    hackerrank: "rahul_codes",
    kaggle: "rahulverma",
    huggingface: "rahul-ai",
    resumeDataUrl: "",
    resumeUpdated: "Jan 2026",
  },
  experience: [
    {
      id: "exp-1",
      role: "AI/ML Engineer Intern",
      company: "NIELIT",
      location: "New Delhi · Remote",
      start: "Feb 2026",
      end: "Aug 2026",
      summary:
        "Building retrieval-augmented systems over large public document corpora for an internal knowledge platform.",
      bullets: [
        "Designed a RAG pipeline indexing 40k+ government documents with FAISS + bge embeddings.",
        "Served inference through a FastAPI gateway — 1.2s p50 latency at 99.2% uptime.",
        "Set up RAGAS-based evaluation: faithfulness improved from 0.71 → 0.89 across 3 iterations.",
      ],
      tech: ["LangChain", "FAISS", "Llama 3.1", "FastAPI", "Docker"],
    },
    {
      id: "exp-2",
      role: "Machine Learning Research Assistant",
      company: "Vision & Language Lab, MNIT",
      location: "Jaipur, India",
      start: "Jun 2025",
      end: "Dec 2025",
      summary:
        "Assisted doctoral research on efficient vision models for low-resource deployment.",
      bullets: [
        "Curated and augmented a 12k-image Indic-script dataset with weak supervision.",
        "Trained + distilled CNN/ViT hybrids in PyTorch; 92.4% top-1 at 4× smaller footprint.",
        "Wrote the lab's reproducible training toolkit (configs, seeds, W&B logging).",
      ],
      tech: ["PyTorch", "OpenCV", "W&B", "Python"],
    },
    {
      id: "exp-3",
      role: "Freelance ML / Backend Developer",
      company: "Independent",
      location: "Remote",
      start: "2024",
      end: "Present",
      summary:
        "Shipping ML-powered features for early-stage products — from forecasting to document automation.",
      bullets: [
        "Built a demand-forecasting service (Prophet + FastAPI) used across 3 retail dashboards.",
        "Automated invoice extraction with OCR + rule/LLM hybrid validation, ~90 hrs/mo saved.",
      ],
      tech: ["FastAPI", "Prophet", "PostgreSQL", "Tesseract"],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.Tech, Computer Science & Engineering",
      school: "Malaviya National Institute of Technology",
      branch: "Jaipur, India",
      start: "2022",
      end: "2026",
      score: "CGPA 8.7 / 10",
      coursework: [
        "Machine Learning",
        "Deep Learning",
        "NLP",
        "Computer Vision",
        "DBMS",
        "Operating Systems",
        "Probability & Statistics",
        "Algorithms",
      ],
      note: "Core team, AI/ML club · Teaching assistant for Data Structures (2 semesters).",
    },
    {
      id: "edu-2",
      degree: "Senior Secondary (Class XII), PCM + CS",
      school: "CBSE",
      branch: "India",
      start: "2020",
      end: "2022",
      score: "94.2%",
      coursework: ["Mathematics", "Physics", "Chemistry", "Computer Science"],
      note: "School topper in Computer Science; built the first computer-science Olympiad cohort.",
    },
  ],
  projects: [
    {
      id: "p-1",
      name: "NeuroQuery",
      tagline: "RAG document intelligence for 40k+ policy documents.",
      problem:
        "Analysts were reading 100s of pages to answer one question. NeuroQuery grounds every answer in cited source chunks.",
      category: "GENAI",
      tech: ["LangChain", "FAISS", "Llama 3.1", "FastAPI", "Sentence-Transformers", "Docker"],
      github: "https://github.com/rahul-ai-engineer/neuroquery",
      demo: "https://huggingface.co/spaces",
      video: "",
      dataset: "40k public policy PDFs (chunked 512 tokens, 10% overlap)",
      model: "Llama-3.1-8B-Instruct · 4-bit GGUF · bge-small embeddings",
      metrics: ["0.89 faithfulness (RAGAS)", "1.2s p50 latency", "98.1% recall@5 retrieval"],
      features: [
        "Hybrid retrieval (dense + BM25 re-rank)",
        "Citation highlighting back to source page",
        "Streaming answers over SSE",
        "Admin eval dashboard with golden set",
      ],
      date: "2026",
      featured: true,
      hidden: false,
      image: "",
      architecture: "rag",
    },
    {
      id: "p-2",
      name: "SignSpeak",
      tagline: "Real-time sign-language to text translation on commodity hardware.",
      problem:
        "Most sign-language tools need gloves or cloud GPUs. SignSpeak runs a MediaPipe + LSTM stack at 24 fps on a laptop CPU.",
      category: "COMPUTER VISION",
      tech: ["MediaPipe", "TensorFlow", "LSTM", "OpenCV", "Python"],
      github: "https://github.com/rahul-ai-engineer/signspeak",
      demo: "",
      video: "",
      dataset: "36-class ISL gesture set, 18k sequence samples (self-collected + public)",
      model: "2-layer BiLSTM over 21-keypoint skeleton sequences",
      metrics: ["94.2% test accuracy", "24 fps on CPU", "<80 MB memory"],
      features: [
        "Live webcam translation with smoothing",
        "Sentence builder with beam decoding",
        "Edge-deployable TFLite export",
      ],
      date: "2025",
      featured: true,
      hidden: false,
      image: "",
      architecture: "cv",
    },
    {
      id: "p-3",
      name: "Varta",
      tagline: "Multilingual support assistant for 5 Indic languages.",
      problem:
        "Small D2C brands lose tickets to language gaps. Varta routes, translates and drafts replies in the customer's language.",
      category: "NLP",
      tech: ["IndicBERT", "Hugging Face", "Flask", "Redis", "Python"],
      github: "https://github.com/rahul-ai-engineer/varta",
      demo: "",
      video: "",
      dataset: "8k labelled support conversations (Hindi, Tamil, Bengali, Marathi, English)",
      model: "IndicBERT intent classifier + IndicT5 reply drafting",
      metrics: ["91.3% intent F1", "3.1× faster first response", "5 languages"],
      features: ["Intent + sentiment routing", "Draft-in-language replies", "Human handoff rules"],
      date: "2025",
      featured: false,
      hidden: false,
      image: "",
      architecture: "nlp",
    },
    {
      id: "p-4",
      name: "SentinelVision",
      tagline: "CCTV anomaly detection that pages a human only when it matters.",
      problem:
        "Security teams drown in footage. Sentinel flags loitering, intrusion and abandoned objects with tracked evidence clips.",
      category: "COMPUTER VISION",
      tech: ["YOLOv8", "DeepSORT", "OpenCV", "FastAPI", "PostgreSQL"],
      github: "https://github.com/rahul-ai-engineer/sentinelvision",
      demo: "",
      video: "",
      dataset: "UCF-Crime subset + 6 hrs self-labelled campus footage",
      model: "YOLOv8n detector + DeepSORT tracks + rule/ML anomaly scorer",
      metrics: ["0.91 mAP@50 detection", "73% fewer false pages", "6 streams on one GPU"],
      features: ["Per-zone rule engine", "Evidence clip export", "Telegram alerting"],
      date: "2025",
      featured: false,
      hidden: false,
      image: "",
      architecture: "cv",
    },
    {
      id: "p-5",
      name: "PromptForge",
      tagline: "An evaluation playground for prompt engineers.",
      problem:
        "Prompt changes ship on vibes. PromptForge runs A/B evals over golden sets with cost + latency accounting.",
      category: "GENAI",
      tech: ["FastAPI", "OpenAI API", "SQLite", "HTMX"],
      github: "https://github.com/rahul-ai-engineer/promptforge",
      demo: "",
      video: "",
      dataset: "User-defined golden sets (JSON/CSV import)",
      model: "Any OpenAI-compatible endpoint",
      metrics: ["<2 min eval on 200 cases", "Cost delta per variant"],
      features: ["Side-by-side variant diff", "LLM-as-judge scoring", "Regression alerts"],
      date: "2025",
      featured: false,
      hidden: false,
      image: "",
      architecture: "rag",
    },
    {
      id: "p-6",
      name: "CropDoc",
      tagline: "Plant disease triage for smallholder farmers.",
      problem:
        "Agronomists are scarce in rural districts. CropDoc triages leaf photos offline-first and suggests vetted treatment.",
      category: "DATA SCIENCE",
      tech: ["TensorFlow", "MobileNetV3", "Flask", "PWA"],
      github: "https://github.com/rahul-ai-engineer/cropdoc",
      demo: "",
      video: "",
      dataset: "PlantVillage + 2k field photos collected with an agri-NGO",
      model: "MobileNetV3 fine-tune, 38 disease classes, quantised to 4.8 MB",
      metrics: ["96.1% val accuracy", "Works offline (PWA)", "4 regional languages"],
      features: ["Offline inference in-browser", "Treatment cards reviewed by agronomists", "Weather-aware advice"],
      date: "2024",
      featured: false,
      hidden: false,
      image: "",
      architecture: "cv",
    },
    {
      id: "p-7",
      name: "SpendSense",
      tagline: "Personal finance forecasting that explains itself.",
      problem:
        "Budgeting apps show history, not the future. SpendSense forecasts 90-day cashflow and narrates the drivers.",
      category: "DATA SCIENCE",
      tech: ["Prophet", "pandas", "FastAPI", "Recharts"],
      github: "https://github.com/rahul-ai-engineer/spendsense",
      demo: "",
      video: "",
      dataset: "Anonymised bank statement exports (CSV)",
      model: "Prophet with regressors + anomaly flags via Isolation Forest",
      metrics: ["8.4% MAPE on 90-day spend", "Auto-categorises 92% of rows"],
      features: ["Scenario sliders", "Subscription leak detection", "Plain-language summaries"],
      date: "2024",
      featured: false,
      hidden: false,
      image: "",
      architecture: "data",
    },
    {
      id: "p-8",
      name: "GitPulse",
      tagline: "A CLI that turns your GitHub history into a health report.",
      problem:
        "Dev metrics dashboards are heavy. GitPulse is one command: streaks, language drift, review turnaround, burnout flags.",
      category: "WEB APPS",
      tech: ["Python", "Typer", "GitHub GraphQL", "Rich"],
      github: "https://github.com/rahul-ai-engineer/gitpulse",
      demo: "",
      video: "",
      dataset: "Any public GitHub profile / org",
      model: "—",
      metrics: ["1.1k installs on PyPI", "Runs in <3s"],
      features: ["Markdown report export", "Org mode", "Offline cache"],
      date: "2024",
      featured: false,
      hidden: false,
      image: "",
      architecture: "none",
    },
  ],
  certificates: [
    {
      id: "c-1",
      title: "Machine Learning Specialization",
      issuer: "DeepLearning.AI · Coursera",
      date: "Aug 2025",
      credentialId: "ML-2025-88412-VK",
      verifyUrl: "https://www.coursera.org/account/accomplishments",
      image: "",
    },
    {
      id: "c-2",
      title: "Generative AI with Large Language Models",
      issuer: "AWS · DeepLearning.AI",
      date: "Oct 2025",
      credentialId: "GENAI-2025-30917",
      verifyUrl: "https://www.coursera.org/account/accomplishments",
      image: "",
    },
    {
      id: "c-3",
      title: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "Jun 2025",
      credentialId: "AWS-CP-77120",
      verifyUrl: "https://aws.amazon.com/verification",
      image: "",
    },
    {
      id: "c-4",
      title: "NLP Course — Completion Track",
      issuer: "Hugging Face",
      date: "Mar 2025",
      credentialId: "HF-NLP-2025-1188",
      verifyUrl: "https://huggingface.co/learn/nlp-course",
      image: "",
    },
    {
      id: "c-5",
      title: "Meta Back-End Developer Professional",
      issuer: "Meta · Coursera",
      date: "Nov 2024",
      credentialId: "META-BE-2024-55021",
      verifyUrl: "https://www.coursera.org/account/accomplishments",
      image: "",
    },
    {
      id: "c-6",
      title: "Smart India Hackathon — National Finalist",
      issuer: "Govt. of India · SIH",
      date: "Dec 2025",
      credentialId: "SIH2025-FIN-4821",
      verifyUrl: "https://www.sih.gov.in",
      image: "",
    },
  ],
  skills: [
    { id: "s-1", group: "Languages", items: ["Python", "C++", "C", "SQL", "JavaScript"] },
    { id: "s-2", group: "ML & DL", items: ["Scikit-learn", "PyTorch", "TensorFlow", "Keras", "CNN", "RNN", "LSTM"] },
    {
      id: "s-3",
      group: "NLP & GenAI",
      items: ["LangChain", "Hugging Face", "RAG", "FAISS", "LLMs", "Embeddings", "Prompt Engineering"],
    },
    { id: "s-4", group: "Backend", items: ["FastAPI", "Flask", "Django", "REST APIs"] },
    { id: "s-5", group: "Databases", items: ["PostgreSQL", "MongoDB", "SQLite"] },
    { id: "s-6", group: "Computer Vision", items: ["OpenCV", "MediaPipe", "YOLO"] },
    { id: "s-7", group: "Tools", items: ["Git", "GitHub", "Docker", "Jupyter", "VS Code", "Linux"] },
  ],
  lab: [
    {
      id: "l-1",
      code: "EXPERIMENT_004",
      title: "RAG DOCUMENT INTELLIGENCE",
      model: "Llama 3.1 8B (4-bit)",
      stack: ["FAISS", "LangChain", "bge-small"],
      status: "EXPERIMENTAL",
      note: "Testing hybrid retrieval + re-ranking on noisy OCR chunks.",
      metric: "faithfulness 0.71 → 0.89",
    },
    {
      id: "l-2",
      code: "EXPERIMENT_007",
      title: "QUANTISED LLM ON EDGE",
      model: "Phi-3 mini · Q4_K_M",
      stack: ["llama.cpp", "ONNX"],
      status: "EXPERIMENTAL",
      note: "Can a useful assistant live on a ₹15k phone? Latency budget 60ms/token.",
      metric: "11 tok/s on Snapdragon 8 Gen 2",
    },
    {
      id: "l-3",
      code: "EXPERIMENT_011",
      title: "VISION TRANSFORMER FROM SCRATCH",
      model: "Custom ViT-S · 22M params",
      stack: ["PyTorch", "W&B"],
      status: "STABLE",
      note: "No library internals — patches, positional encodings, attention by hand.",
      metric: "92.4% CIFAR-100, 200 epochs",
    },
    {
      id: "l-4",
      code: "EXPERIMENT_013",
      title: "MULTI-AGENT RESEARCH ASSISTANT",
      model: "Mixtral 8x7B via vLLM",
      stack: ["LangGraph", "ReAct", "Tavily"],
      status: "EXPERIMENTAL",
      note: "Planner → searcher → writer agents with a critique loop. Watchdog kills runaway tool calls.",
      metric: "68% task completion on GAIA-lite",
    },
    {
      id: "l-5",
      code: "EXPERIMENT_002",
      title: "VECTOR DB BENCHMARK — FAISS vs CHROMA",
      model: "bge-base embeddings",
      stack: ["FAISS", "Chroma", "DuckDB"],
      status: "ARCHIVED",
      note: "1M vectors, recall@10 vs p95 latency. FAISS-IVF wins on latency, Chroma on DX.",
      metric: "p95 8ms (FAISS) / 21ms (Chroma)",
    },
  ],
  achievements: [
    {
      id: "a-1",
      year: "2025",
      kind: "HACKATHON",
      title: "Smart India Hackathon — National Finalist",
      detail: "Led a 6-member team; built an agri-advisory RAG system among 48 national finalists.",
    },
    {
      id: "a-2",
      year: "2025",
      kind: "COMPETITION",
      title: "HackWithInfy — National Top 50",
      detail: "Algorithmic rounds + ML problem statement; top 50 of 300k+ participants.",
    },
    {
      id: "a-3",
      year: "2025",
      kind: "KAGGLE",
      title: "Bronze — Tabular Playground Series",
      detail: "Gradient-boosting ensemble with adversarial validation; top 4% of 2.3k teams.",
    },
    {
      id: "a-4",
      year: "2024",
      kind: "OPEN SOURCE",
      title: "Contributor — LangChain docs & cookbook",
      detail: "12 merged PRs: retrieval evals notebook, FAISS integration fixes.",
    },
    {
      id: "a-5",
      year: "2025",
      kind: "SPEAKING",
      title: "Talk — 'RAG beyond the demo' at PyRaj Meetup",
      detail: "60+ attendees; honest walkthrough of retrieval failures and evals.",
    },
    {
      id: "a-6",
      year: "2023",
      kind: "MILESTONE",
      title: "Dean's List — Academic Excellence",
      detail: "Top 5% of the CSE cohort, 4 consecutive semesters.",
    },
  ],
  socials: [
    { id: "so-1", platform: "GitHub", username: "rahul-ai-engineer", url: "https://github.com", note: "Where the code lives", enabled: true },
    { id: "so-2", platform: "LinkedIn", username: "in/rahul-verma-ai", url: "https://www.linkedin.com", note: "Professional updates", enabled: true },
    { id: "so-3", platform: "Kaggle", username: "rahulverma", url: "https://www.kaggle.com", note: "Competitions & notebooks", enabled: true },
    { id: "so-4", platform: "Hugging Face", username: "rahul-ai", url: "https://huggingface.co", note: "Models & Spaces", enabled: true },
    { id: "so-5", platform: "LeetCode", username: "rahul_codes", url: "https://leetcode.com", note: "500+ problems", enabled: true },
    { id: "so-6", platform: "Codeforces", username: "", url: "https://codeforces.com", note: "Contest handle (pupil → specialist)", enabled: true },
    { id: "so-7", platform: "X / Twitter", username: "@rahul_builds_ai", url: "https://x.com", note: "Build logs in public", enabled: true },
    { id: "so-8", platform: "YouTube", username: "@rahul.ai", url: "https://youtube.com", note: "ML experiment videos", enabled: false },
    { id: "so-9", platform: "Email", username: "hello@rahul.ai", url: "mailto:hello@rahul.ai", note: "Fastest channel", enabled: true },
  ],
};
