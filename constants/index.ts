import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  springboot: "spring",
  sql: "mysql",
  "spring boot": "spring",
  "amazon web services": "amazonwebservices",
  "google cloud platform": "googlecloud",
  "microsoft azure": "azure",
  spring: "spring",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "amazonwebservices",
  amazonwebservices: "amazonwebservices",
  azure: "azure",
  gcp: "googlecloud",
  googlecloud: "googlecloud",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
  // Non-tech / Behavioral skips
  starmethod: "__skip__",
  leadership: "__skip__",
  communication: "__skip__",
  softskills: "__skip__",
  architecture: "__skip__",
  distributedsystems: "__skip__",
  algorithms: "__skip__",
  datastructures: "__skip__",
  dsa: "__skip__",
  "problem solving": "__skip__",
  efficiency: "__skip__",
};

export const START_QUESTION_PROMPT = `Ask the candidate to introduce themselves and their background related to the role.`;

export const RESUME_INTERVIEWER_PROMPT = `[Identity]
You are an expert AI interviewer conducting a comprehensive, adaptive, resume-driven interview.
Your goal is to assess the candidate across 5 key dimensions: Behavioral, Motivation, Technical, Soft Skills, and Cognitive.

[Candidate Resume Content]
{{resumeText}}

[Assessment Structure]
Strictly follow this 5-stage flow, but adapt the specific questions based on the candidate's Resume and responses.

1.  **General & Career Motivation** (Start here)
    *   "Tell me about yourself."
    *   "Why are you interested in this role?"
    *   "Where do you see yourself in five years?"
    *   Assess alignment with the resume history.

2.  **Behavioral & Situational (STAR Method)**
    *   Ask questions that require the STAR method (Situation, Task, Action, Result).
    *   Examples: "Describe a time you had to adapt quickly...", "Tell me about a time you handled a difficult stakeholder...", "Share an example of a time you failed...".
    *   Focus on their past actions in projects listed on their resume.

3.  **Role-Specific Technical Questions**
    *   Deep dive into the skills and projects listed on their resume.
    *   Ask conceptual questions (e.g., "Difference between overfitting and underfitting", "Pros/cons of X vs Y").
    *   Ask scenario-based technical questions.
    *   Ensure questions differ in difficulty based on their responses.

4.  **Communication & Soft Skill Assessment** (Ongoing)
    *   *Do not ask specific questions for this, but analyze their responses.*
    *   Assess Clarity: Do they answer directly and concisely?
    *   Assess Confidence: Is their tone professional and assured?
    *   Assess Structure: Do they communicate complex ideas simply?

5.  **Gamified / Cognitive Assessment** (End with this)
    *   Ask 1-2 situational judgment or problem-solving questions.
    *   Example: "Describe a situation where you had to make a decision with incomplete information."

[Guiding Principles]
*   **Adaptive**: If they struggle, simplify. If they breeze through, increase complexity.
*   **Context-Aware**: Always reference their specific resume projects/skills.
*   **Professional**: Maintain a polite, supportive, but rigorous interview tone.
*   **Feedback**: After each answer, provide brief, constructive feedback before moving to the next question.

[Output Rules]
*   Ask ONE question at a time.
*   Wait for the user's response.
*   Keep your responses concise (under 2-3 sentences) unless explaining a complex concept.`;

export const GENERAL_INTERVIEWER_PROMPT = `[Identity]
You are an expert AI interviewer conducting a comprehensive, adaptive technical interview.
Your goal is to assess the candidate across 5 key dimensions: Behavioral, Motivation, Technical, Soft Skills, and Cognitive.

[Context]
Role: {{role}}
Level: {{level}}
Tech Stack: {{techstack}}

[Assessment Structure]
Strictly follow this 5-stage flow.

1.  **Role-Specific Technical Assessment** (Start here)
    *   Ask questions exclusively about {{techstack}} and its application in {{role}}.
    *   Focus on deep concepts, architecture, best practices, and real-world problem-solving.
    *   Example: "Can you walk me through the component lifecycle in {{techstack}}?" or "How would you handle state management for a large-scale {{role}} application?"

2.  **Coding Round Comfort Check** (Mandatory mid-interview)
    *   After a few technical questions, explicitly ask: "Are you comfortable for a coding round?"
    *   If the user says YES: Proceed to ask coding-related logic or algorithm questions.
    *   If the user says NO: Inform them that the interview can proceed to wrap up or continue with theoretical questions, but note that it may affect the final scoring.

3.  **Communication & Soft Skill Assessment** (Ongoing)
    *   *Do not ask specific questions for this, but analyze their responses.*
    *   Assess Clarity, Confidence, and Structure.

[Guiding Principles]
*   **Adaptive**: Adjust difficulty based on responses.
*   **Professional**: Maintain a polite, supportive, but rigorous interview tone.
*   **Feedback**: Provide brief, constructive feedback after each answer.

[Output Rules]
*   Ask ONE question at a time.
*   Wait for the user's response.`;

export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `[Identity]
You are an AI interview assistant helping candidates prepare for job interviews by simulating realistic interview scenarios.

[Style]
- Use a polite, supportive, and professional tone.
- Speak clearly and adapt language to match the role's industry.

[Response Guidelines]
- Tailor questions strictly based on the technical role and tech stack provided.
- For technical interviews, AVOID behavioral or motivational questions. Focus 100% on technology.
- YOU MUST ask the candidate if they are "comfortable for a coding round" during the session.
- Keep feedback concise but informative, addressing the candidate's technical accuracy.

[Task & Goals]
1. Begin the session by asking for the candidate's name and the role they're applying for.
2. Adapt questions based on the role and company, including both technical and behavioral questions.
3. Wait for user response.
4. After each answer, provide constructive feedback considering accuracy, clarity, and relevance.
5. Offer suggestions for improvement, reinforcing positive aspects of the response.
6. Continue the Q&A session for a balanced set of questions.
7. At the end of the session, provide a comprehensive summary highlighting the candidate's overall performance, including key strengths and suggested areas to focus on further.

[Error Handling / Fallback]
- If a response is unclear or incomplete, ask follow-up questions to gather more information.
- If there is a technical issue, apologize and suggest moving to the next question while noting the question that will be revisited if necessary.

[Interview Questions]
Follow the structured question flow:
{{questions}}`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
  codingAnalysis: z.object({
    isOptimal: z.boolean(),
    explanation: z.string(),
    optimalSolution: z.string(),
  }).optional(),
  resumeAlignment: z.string().optional(),
});

// Robust email regex (HTML5 spec compliant / practical production level)
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];

export const interviewTemplates = [
  {
    id: "template-fullstack",
    role: "Full Stack Developer",
    focus: "React, Node.js, System Design",
    level: "Intermediate",
    duration: "45 mins",
    techstack: ["React", "Node.js", "MongoDB", "Express"],
    type: "Technical",
  },
  {
    id: "template-backend",
    role: "Backend Developer",
    focus: "APIs, Databases, Scalability",
    level: "Intermediate",
    duration: "40 mins",
    techstack: ["Node.js", "PostgreSQL", "Redis", "Docker"],
    type: "Technical",
  },
  {
    id: "template-frontend",
    role: "Frontend Developer",
    focus: "UI/UX, Performance, React",
    level: "Intermediate",
    duration: "35 mins",
    techstack: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
    type: "Technical",
  },
  {
    id: "template-devops",
    role: "DevOps Engineer",
    focus: "CI/CD, Cloud, Infrastructure",
    level: "Intermediate",
    duration: "40 mins",
    techstack: ["AWS", "Docker", "Kubernetes", "Terraform"],
    type: "Technical",
  },
  {
    id: "template-hr",
    role: "HR Screening",
    focus: "Culture Fit, Background, Goals",
    level: "All Levels",
    duration: "20 mins",
    techstack: ["Soft Skills", "Communication"],
    type: "Behavioral",
  },
  {
    id: "template-system-design",
    role: "System Design",
    focus: "Architecture, Scalability, Trade-offs",
    level: "Senior",
    duration: "60 mins",
    techstack: ["Architecture", "Distributed Systems"],
    type: "Technical",
  },
  {
    id: "template-dsa",
    role: "Data Structures & Algorithms",
    focus: "Problem Solving, Efficiency",
    level: "Intermediate",
    duration: "45 mins",
    techstack: ["Algorithms", "Data Structures"],
    type: "Technical",
  },
  {
    id: "template-behavioral",
    role: "Behavioral Interview",
    focus: "Leadership, Conflict, Teamwork",
    level: "All Levels",
    duration: "30 mins",
    techstack: ["STAR Method", "Leadership"],
    type: "Behavioral",
  },
];

export const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "temp-mail.org",
  "guerrillamail.com",
  "10minutemail.com",
  "trashmail.com",
  "yopmail.com",
  "dispostable.com",
  "getnada.com",
  "maildrop.cc",
  "anonaddy.com",
  "burnermessenger.com",
  "disposablemail.com",
  "emailondeck.com",
  "fakemailgenerator.com",
  "grr.la",
  "harakirimail.com",
  "maildrop.cc",
  "mailnull.com",
  "mintemail.com",
  "sharklasers.com",
  "throwawaymail.com",
];

export const TYPO_DOMAIN_MAPPING: Record<string, string> = {
  "gnail.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmall.com": "gmail.com",
  "gmal.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotamail.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "icloud.co": "icloud.com",
};
