// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  redirect: jest.fn(),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock Clerk authentication
jest.mock('@/services/clerk/lib/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}))

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children, ...props }) => <button {...props}>{children}</button>,
  SignUpButton: ({ children, ...props }) => <button {...props}>{children}</button>,
  UserButton: () => <div data-testid="user-button" />,
  useUser: () => ({
    isSignedIn: false,
    user: null,
  }),
  useAuth: () => ({
    userId: null,
    isLoaded: true,
  }),
}))

// Mock Clerk webhooks
jest.mock('@clerk/nextjs/webhooks', () => ({
  verifyWebhook: jest.fn(),
}))

// Mock database
jest.mock('@/drizzle/db', () => ({
  db: {
    query: {
      JobInfoTable: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      QuestionTable: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      InterviewTable: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      UserTable: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    },
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock AI services
jest.mock('@/services/ai/questions', () => ({
  generateAiQuestion: jest.fn(),
  generateAiQuestionFeedback: jest.fn(),
}))

jest.mock('@/services/ai/resumes/ai', () => ({
  analyzeResumeForJob: jest.fn(),
}))

jest.mock('@/services/ai/interviews', () => ({
  generateAiInterviewFeedback: jest.fn(),
}))

// Mock Arcjet
jest.mock('@arcjet/next', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    protect: jest.fn(),
  })),
  tokenBucket: jest.fn(),
  request: jest.fn(),
}))

// Mock cache tag
jest.mock('next/dist/server/use-cache/cache-tag', () => ({
  cacheTag: jest.fn(),
}))

// Mock AI SDK
jest.mock('ai', () => ({
  createDataStreamResponse: jest.fn(),
}))

// Mock file handling
global.File = class File {
  constructor(parts, filename, options = {}) {
    this.parts = parts
    this.name = filename
    this.size = parts.reduce((acc, part) => acc + (part.length || 0), 0)
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
  }
}

global.FormData = class FormData {
  constructor() {
    this.data = new Map()
  }
  append(key, value) {
    this.data.set(key, value)
  }
  get(key) {
    return this.data.get(key)
  }
  has(key) {
    return this.data.has(key)
  }
  delete(key) {
    this.data.delete(key)
  }
}


// Mock window.matchMedia for components that use it (e.g., sonner)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock react-markdown
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children, ...props }) => {
    return <div data-testid="markdown">{children}</div>
  },
}))

// Mock react-resizable-panels
jest.mock('react-resizable-panels', () => ({
  PanelGroup: ({ children, ...props }) => <div {...props}>{children}</div>,
  Panel: ({ children, ...props }) => <div {...props}>{children}</div>,
  PanelResizeHandle: ({ children, ...props }) => <div {...props}>{children}</div>,
}))

// Mock @t3-oss/env-nextjs
jest.mock('@t3-oss/env-nextjs', () => ({
  createEnv: jest.fn(() => ({
    ARCJET_KEY: 'test-arcjet-key',
    CLERK_SECRET_KEY: 'test-clerk-secret',
    HUME_API_KEY: 'test-hume-api-key',
    HUME_SECRET_KEY: 'test-hume-secret-key',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USER: 'test-user',
    DB_NAME: 'test-db',
    DB_PASSWORD: 'test-password',
  })),
}))

// Mock environment variables
process.env.ARCJET_KEY = 'test-key'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key'
process.env.CLERK_SECRET_KEY = 'test-secret'

