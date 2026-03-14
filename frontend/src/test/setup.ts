import '@testing-library/jest-dom'

// Polyfill for IntersectionObserver (used by Framer Motion)
globalThis.IntersectionObserver = class IntersectionObserver {
  observe()    { return null }
  unobserve()  { return null }
  disconnect() { return null }
} as unknown as typeof IntersectionObserver

// Polyfill for ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe()    { return null }
  unobserve()  { return null }
  disconnect() { return null }
} as unknown as typeof ResizeObserver

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter:   () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useParams:   () => ({}),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react').createElement('a', { href, ...props }, children)
  ),
}))
