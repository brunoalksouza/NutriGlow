class CacheService {
  private static instance: CacheService
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  set(key: string, data: any, ttlMinutes = 30): void {
    const ttl = ttlMinutes * 60 * 1000 // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  // Cache diet plans for offline access
  cacheDietPlan(userId: string, dietPlan: any): void {
    this.set(`diet_${userId}`, dietPlan, 60 * 24) // Cache for 24 hours
  }

  getCachedDietPlan(userId: string): any | null {
    return this.get(`diet_${userId}`)
  }
}

export const cache = CacheService.getInstance()
