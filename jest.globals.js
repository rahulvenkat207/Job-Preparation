// Global polyfills that must be available before any modules are imported
// This file runs before the test environment is set up

// Polyfill TextEncoder/TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Polyfill Headers for Request/Response
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = new Map()
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value)
        })
      }
    }
    get(name) {
      return this._headers.get(name.toLowerCase())
    }
    set(name, value) {
      this._headers.set(name.toLowerCase(), value)
    }
    has(name) {
      return this._headers.has(name.toLowerCase())
    }
  }
}

// Polyfill Request/Response for Next.js (only if not available)
// Node.js 18+ has these built-in, but we need to ensure they're available
if (typeof global.Request === 'undefined') {
  // Use the built-in Request if available (Node.js 18+)
  try {
    const { Request, Response } = require('undici')
    global.Request = Request
    global.Response = Response
  } catch {
    // Fallback to simple polyfill if undici is not available
    global.Request = class Request {
      constructor(input, init = {}) {
        const url = typeof input === 'string' ? input : input?.url || ''
        Object.defineProperty(this, 'url', {
          value: url,
          writable: false,
          enumerable: true,
          configurable: false,
        })
        this.method = init.method || 'GET'
        this.headers = new Headers(init.headers)
        this.body = init.body
      }
    }

    global.Response = class Response {
      constructor(body, init = {}) {
        this.body = body
        this.status = init.status || 200
        this.statusText = init.statusText || 'OK'
        this.headers = new Headers(init.headers)
      }
      text() {
        return Promise.resolve(String(this.body || ''))
      }
      json() {
        return Promise.resolve(JSON.parse(String(this.body || '{}')))
      }
    }
  }
}

