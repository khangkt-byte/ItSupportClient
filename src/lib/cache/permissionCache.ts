/**
 * Permission Cache Manager
 * 
 * Multi-layer caching strategy:
 * 1. Memory cache (fastest)
 * 2. localStorage cache (persistent)
 * 3. API cache from authApi (with TTL)
 * 
 * Features:
 * - Cross-tab synchronization via BroadcastChannel
 * - Automatic TTL invalidation
 * - localStorage recovery on page load
 * - Memory-safe cleanup
 * 
 * References:
 * - Cache busting patterns: https://developer.chrome.com/docs/workbox/caching-strategies/
 * - BroadcastChannel API: https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
 */

/**
 * Permission cache entry
 */
interface CacheEntry {
    permissions: string[];
    timestamp: number;
    ttl: number;
}

/**
 * Permission Cache Manager class
 */
class PermissionCacheManager {
    private memoryCache: Map<string, CacheEntry> = new Map();
    private readonly STORAGE_KEY = 'itsupp_perm_cache';
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    private cacheChannel: BroadcastChannel | null = null;

    constructor() {
        this.initializeCacheChannel();
        this.loadFromLocalStorage();
    }

    /**
     * Initialize cross-tab cache synchronization
     */
    private initializeCacheChannel(): void {
        if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
            return;
        }

        try {
            this.cacheChannel = new BroadcastChannel('permission-cache');

            this.cacheChannel.addEventListener('message', (event) => {
                const { type, key, value } = event.data;

                if (type === 'CACHE_UPDATE') {
                    // Update memory cache from other tabs
                    if (value) {
                        this.memoryCache.set(key, value);
                    } else {
                        this.memoryCache.delete(key);
                    }

                    console.log('[PermissionCache] 📢 Updated from other tab:', key);
                } else if (type === 'CACHE_CLEAR') {
                    // Clear cache from other tabs
                    this.memoryCache.clear();
                    console.log('[PermissionCache] 🗑️ Cleared from other tab');
                }
            });

            console.log('[PermissionCache] ✅ Cross-tab sync initialized');
        } catch (error) {
            console.warn('[PermissionCache] ⚠️ BroadcastChannel not available:', error);
        }
    }

    /**
     * Load cache from localStorage
     * Called on initialization
     */
    private loadFromLocalStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return;

            const cached = JSON.parse(stored) as Record<string, CacheEntry>;
            const now = Date.now();

            Object.entries(cached).forEach(([key, entry]) => {
                // Check if still valid
                if (now - entry.timestamp < entry.ttl) {
                    this.memoryCache.set(key, entry);
                }
            });

            console.log(
                `[PermissionCache] 💾 Loaded ${this.memoryCache.size} entries from localStorage`
            );
        } catch (error) {
            console.error('[PermissionCache] ❌ Failed to load from localStorage:', error);
        }
    }

    /**
     * Save cache to localStorage
     */
    private saveToLocalStorage(): void {
        try {
            const cacheData: Record<string, CacheEntry> = {};
            const now = Date.now();

            // Only save entries that haven't expired
            this.memoryCache.forEach((entry, key) => {
                if (now - entry.timestamp < entry.ttl) {
                    cacheData[key] = entry;
                }
            });

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('[PermissionCache] ⚠️ Failed to save to localStorage:', error);
        }
    }

    /**
     * Get cached permissions for user
     */
    get(userId: string): string[] | null {
        const entry = this.memoryCache.get(userId);
        if (!entry) {
            return null;
        }

        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            // Invalidate expired entry
            this.memoryCache.delete(userId);
            return null;
        }

        return entry.permissions;
    }

    /**
     * Set permissions cache for user
     */
    set(userId: string, permissions: string[], ttl: number = this.DEFAULT_TTL): void {
        const entry: CacheEntry = {
            permissions,
            timestamp: Date.now(),
            ttl
        };

        this.memoryCache.set(userId, entry);
        this.saveToLocalStorage();

        // Notify other tabs
        this.cacheChannel?.postMessage({
            type: 'CACHE_UPDATE',
            key: userId,
            value: entry
        });

        console.log(`[PermissionCache] 💾 Cached ${permissions.length} permissions for user: ${userId}`);
    }

    /**
     * Check if cache is valid for user
     */
    isValid(userId: string): boolean {
        const entry = this.memoryCache.get(userId);
        if (!entry) return false;

        const now = Date.now();
        return now - entry.timestamp < entry.ttl;
    }

    /**
     * Get cache entry metadata (for debugging)
     */
    getMetadata(userId: string): {
        cached: boolean;
        age: number;
        ttl: number;
        valid: boolean;
    } | null {
        const entry = this.memoryCache.get(userId);
        if (!entry) {
            return null;
        }

        const now = Date.now();
        const age = now - entry.timestamp;
        const valid = age < entry.ttl;

        return {
            cached: true,
            age,
            ttl: entry.ttl,
            valid
        };
    }

    /**
     * Clear specific user cache
     */
    clear(userId: string): void {
        this.memoryCache.delete(userId);
        this.saveToLocalStorage();

        // Notify other tabs
        this.cacheChannel?.postMessage({
            type: 'CACHE_UPDATE',
            key: userId,
            value: null
        });

        console.log(`[PermissionCache] 🗑️ Cleared cache for user: ${userId}`);
    }

    /**
     * Clear all cache
     */
    clearAll(): void {
        this.memoryCache.clear();
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.warn('[PermissionCache] ⚠️ Failed to clear localStorage:', error);
        }

        // Notify other tabs
        this.cacheChannel?.postMessage({
            type: 'CACHE_CLEAR'
        });

        console.log('[PermissionCache] 🗑️ Cleared all cache');
    }

    /**
     * Get cache statistics (for debugging)
     */
    getStats(): {
        entries: number;
        memory: string;
    } {
        return {
            entries: this.memoryCache.size,
            memory: `${(new Blob([JSON.stringify(Array.from(this.memoryCache.entries()))]).size / 1024).toFixed(2)} KB`
        };
    }

    /**
     * Cleanup on page unload
     */
    cleanup(): void {
        try {
            this.cacheChannel?.close();
            this.saveToLocalStorage();
            console.log('[PermissionCache] 👋 Cleanup completed');
        } catch (error) {
            console.warn('[PermissionCache] ⚠️ Cleanup error:', error);
        }
    }
}

/**
 * Singleton instance
 */
export const permissionCache = new PermissionCacheManager();

/**
 * Cleanup on page unload
 */
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        permissionCache.cleanup();
    });
}

/**
 * Export types
 */
export type { CacheEntry };
