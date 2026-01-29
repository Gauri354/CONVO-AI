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
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
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
};

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
- Tailor questions based on the specific company and role details provided.
- Alternate between technical and behavioral questions relevant to the role.
- Keep feedback concise but informative, addressing the candidate's strengths and areas for improvement.

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
