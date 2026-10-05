/**
 * Rate limiter behind a tiny interface. The in-memory implementation is per-process; swap
 * `limiter` for a Redis-backed one when running multiple instances.
 */
export interface RateLimiter {
  /** Returns true when the call is allowed. */
  hit(key: string, limit: number, windowMs: number): boolean;
  reset(key: string): void;
}

class MemoryLimiter implements RateLimiter {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  hit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    if (this.buckets.size > 10_000) {
      for (const [k, b] of this.buckets) if (b.resetAt < now) this.buckets.delete(k);
    }
    const b = this.buckets.get(key);
    if (!b || b.resetAt < now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    b.count += 1;
    return b.count <= limit;
  }

  reset(key: string) {
    this.buckets.delete(key);
  }
}

const g = globalThis as unknown as { __limiter?: RateLimiter };
export const limiter: RateLimiter = (g.__limiter ??= new MemoryLimiter());
