import '@testing-library/jest-dom'

// Mock для Screen Management API
Object.defineProperty(window, 'getScreenDetails', {
  writable: true,
  value: jest.fn().mockResolvedValue({
    screens: [
      {
        left: 0,
        top: 0,
        availWidth: 1920,
        availHeight: 1080,
      }
    ]
  })
})

// In-memory localStorage mock
const createInMemoryStorage = () => {
  const store = new Map<string, string>();
  
  return {
    getItem: jest.fn((key: string) => store.get(key) || null),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      store.delete(key);
    }),
    clear: jest.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: jest.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] || null;
    })
  };
};

const localStorageMock = createInMemoryStorage();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const sessionStorageMock = createInMemoryStorage();
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock для crypto.randomUUID
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
  }
});

// Mock для window properties
Object.defineProperty(window, 'screen', {
  writable: true,
  value: {
    availWidth: 1920,
    availHeight: 1080,
  }
})

Object.defineProperty(window, 'screenX', {
  writable: true,
  value: 0,
})

Object.defineProperty(window, 'screenY', {
  writable: true,
  value: 0,
})

Object.defineProperty(window, 'outerWidth', {
  writable: true,
  value: 1200,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 800,
})