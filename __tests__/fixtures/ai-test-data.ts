/**
 * Sample test data for AI feature validation
 */

export interface QuestionFeedbackTestData {
  question: string
  answer: string
  quality: 'excellent' | 'good' | 'average' | 'poor'
  expectedRatingRange: [number, number]
}

export interface InterviewFeedbackTestData {
  transcript: Array<{
    speaker: 'interviewee' | 'interviewer'
    text: string
    emotionFeatures?: Record<string, number>
  }>
  jobInfo: {
    title: string
    description: string
    experienceLevel: string
  }
  userName: string
  performanceLevel: 'excellent' | 'good' | 'average' | 'poor'
}

export interface ResumeAnalysisTestData {
  resumeText: string
  jobInfo: {
    title: string
    description: string
    experienceLevel: string
  }
  quality: 'excellent' | 'good' | 'average' | 'poor'
}

// Question Feedback Test Data
export const questionFeedbackTestData: QuestionFeedbackTestData[] = [
  {
    question: 'What is React and how does it differ from other JavaScript frameworks?',
    answer: 'React is a JavaScript library for building user interfaces, developed by Facebook. It uses a virtual DOM to efficiently update the UI, and follows a component-based architecture. Unlike frameworks like Angular, React is more lightweight and focuses solely on the view layer. It uses JSX for templating and supports one-way data binding. React also has a large ecosystem with tools like React Router for routing and Redux for state management.',
    quality: 'excellent',
    expectedRatingRange: [8, 10],
  },
  {
    question: 'Explain closures in JavaScript.',
    answer: 'Closures are functions that have access to variables in their outer scope even after the outer function has returned. They allow for data privacy and can be used to create function factories.',
    quality: 'good',
    expectedRatingRange: [6, 8],
  },
  {
    question: 'What is the difference between let, const, and var in JavaScript?',
    answer: 'let and const are block scoped, var is function scoped. const cannot be reassigned.',
    quality: 'average',
    expectedRatingRange: [4, 6],
  },
  {
    question: 'How do you optimize a React application?',
    answer: 'Use React.',
    quality: 'poor',
    expectedRatingRange: [1, 4],
  },
  {
    question: 'Explain the concept of state management in React applications.',
    answer: '',
    quality: 'poor',
    expectedRatingRange: [1, 3],
  },
  {
    question: 'What is TypeScript and why would you use it?',
    answer: 'TypeScript is a superset of JavaScript that adds static type checking. It helps catch errors at compile time, improves code maintainability, provides better IDE support with autocomplete and refactoring tools, and makes code more self-documenting. It compiles to plain JavaScript, so it can be used anywhere JavaScript runs. TypeScript is particularly useful in large codebases where type safety can prevent many runtime errors and make refactoring safer.',
    quality: 'excellent',
    expectedRatingRange: [8, 10],
  },
]

// Interview Feedback Test Data
export const interviewFeedbackTestData: InterviewFeedbackTestData[] = [
  {
    transcript: [
      {
        speaker: 'interviewer',
        text: 'Hello, thank you for coming in today. Can you tell me a bit about yourself?',
      },
      {
        speaker: 'interviewee',
        text: 'Hi, thank you for having me. I have five years of experience as a full-stack developer, primarily working with React, Node.js, and TypeScript. I recently led a team that built a scalable e-commerce platform that increased sales by 30%.',
        emotionFeatures: { confidence: 0.8, calmness: 0.7 },
      },
      {
        speaker: 'interviewer',
        text: 'That sounds impressive. Can you walk me through how you would approach building a real-time chat feature?',
      },
      {
        speaker: 'interviewee',
        text: 'Sure. I would start by choosing the right technology stack. For real-time communication, I would use WebSockets, probably with Socket.io for Node.js. I would design the architecture to handle message persistence, user presence, and scaling considerations. I would also implement proper error handling and reconnection logic.',
        emotionFeatures: { confidence: 0.75, calmness: 0.8 },
      },
      {
        speaker: 'interviewer',
        text: 'Great. Do you have any questions for us?',
      },
      {
        speaker: 'interviewee',
        text: 'Yes, I am curious about the team structure and what technologies the team is currently using. Also, what are the biggest technical challenges the team is facing right now?',
        emotionFeatures: { confidence: 0.7, interest: 0.85 },
      },
    ],
    jobInfo: {
      title: 'Senior Full-Stack Developer',
      description: 'We are looking for an experienced full-stack developer with expertise in React, Node.js, and TypeScript. The role involves building scalable web applications, leading technical initiatives, and mentoring junior developers.',
      experienceLevel: 'senior',
    },
    userName: 'John Doe',
    performanceLevel: 'excellent',
  },
  {
    transcript: [
      {
        speaker: 'interviewer',
        text: 'Hello, can you tell me about your experience?',
      },
      {
        speaker: 'interviewee',
        text: 'Um, I have some experience with, you know, programming and stuff.',
        emotionFeatures: { nervousness: 0.7, uncertainty: 0.6 },
      },
      {
        speaker: 'interviewer',
        text: 'Can you explain what React hooks are?',
      },
      {
        speaker: 'interviewee',
        text: 'Hooks? Um, they are like functions you use in React components, I think.',
        emotionFeatures: { nervousness: 0.8, uncertainty: 0.75 },
      },
      {
        speaker: 'interviewer',
        text: 'Do you have any questions?',
      },
      {
        speaker: 'interviewee',
        text: 'No, not really.',
        emotionFeatures: { nervousness: 0.6 },
      },
    ],
    jobInfo: {
      title: 'Mid-Level Frontend Developer',
      description: 'We need a frontend developer with strong React skills and experience building user interfaces.',
      experienceLevel: 'mid',
    },
    userName: 'Jane Smith',
    performanceLevel: 'poor',
  },
  {
    transcript: [
      {
        speaker: 'interviewer',
        text: 'Tell me about a challenging project you worked on.',
      },
      {
        speaker: 'interviewee',
        text: 'I worked on a project where we had to migrate a legacy system to a modern stack. It was challenging because we had to maintain backward compatibility while introducing new features. We used a gradual migration strategy and feature flags to manage the transition.',
        emotionFeatures: { confidence: 0.6, calmness: 0.65 },
      },
      {
        speaker: 'interviewer',
        text: 'How do you handle code reviews?',
      },
      {
        speaker: 'interviewee',
        text: 'I try to provide constructive feedback and focus on code quality and best practices. I also appreciate feedback on my own code.',
        emotionFeatures: { confidence: 0.65 },
      },
    ],
    jobInfo: {
      title: 'Software Engineer',
      description: 'Looking for a software engineer with experience in modern web development.',
      experienceLevel: 'mid',
    },
    userName: 'Bob Johnson',
    performanceLevel: 'average',
  },
]

// Resume Analysis Test Data
export const resumeAnalysisTestData: ResumeAnalysisTestData[] = [
  {
    resumeText: `JOHN DOE
Senior Full-Stack Developer
Email: john.doe@email.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced full-stack developer with 5+ years of expertise in React, Node.js, TypeScript, and cloud technologies. Proven track record of leading development teams and delivering scalable web applications that drive business results.

TECHNICAL SKILLS
• Frontend: React, TypeScript, Next.js, Redux, Tailwind CSS
• Backend: Node.js, Express, REST APIs, GraphQL
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jest, Webpack, CI/CD

PROFESSIONAL EXPERIENCE

Senior Full-Stack Developer | Tech Company Inc. | 2020 - Present
• Led a team of 4 developers in building a scalable e-commerce platform using React and Node.js
• Increased application performance by 40% through optimization and caching strategies
• Implemented CI/CD pipelines reducing deployment time by 50%
• Mentored junior developers and conducted code reviews

Full-Stack Developer | Startup Co. | 2018 - 2020
• Developed and maintained multiple React applications serving 100K+ users
• Built RESTful APIs using Node.js and Express
• Collaborated with cross-functional teams to deliver features on time

EDUCATION
Bachelor of Science in Computer Science | University Name | 2018`,
    jobInfo: {
      title: 'Senior Full-Stack Developer',
      description: 'We are looking for an experienced full-stack developer with expertise in React, Node.js, and TypeScript. The role involves building scalable web applications, leading technical initiatives, and mentoring junior developers. Experience with cloud technologies (AWS) and CI/CD is a plus.',
      experienceLevel: 'senior',
    },
    quality: 'excellent',
  },
  {
    resumeText: `JANE SMITH
Developer
jane@email.com

SKILLS
JavaScript, HTML, CSS

EXPERIENCE
Worked on some projects. Did coding stuff.

EDUCATION
Some college`,
    jobInfo: {
      title: 'Mid-Level Frontend Developer',
      description: 'We need a frontend developer with strong React skills, TypeScript experience, and knowledge of modern build tools. Experience with state management libraries and testing frameworks is required.',
      experienceLevel: 'mid',
    },
    quality: 'poor',
  },
  {
    resumeText: `BOB JOHNSON
Software Engineer
Email: bob.johnson@email.com | Phone: (555) 987-6543

SUMMARY
Software engineer with 3 years of experience in web development.

SKILLS
React, JavaScript, Node.js, SQL

EXPERIENCE

Software Engineer | Company ABC | 2021 - Present
• Developed React components for web applications
• Worked with Node.js backend services
• Participated in code reviews

EDUCATION
Bachelor of Science in Computer Science | State University | 2021`,
    jobInfo: {
      title: 'Software Engineer',
      description: 'Looking for a software engineer with experience in React and Node.js. Knowledge of TypeScript and testing is preferred.',
      experienceLevel: 'mid',
    },
    quality: 'average',
  },
]

// Helper function to create File objects for resume tests
export function createResumeFile(content: string, filename: string = 'resume.txt'): File {
  const blob = new Blob([content], { type: 'text/plain' })
  return new File([blob], filename, { type: 'text/plain' })
}

