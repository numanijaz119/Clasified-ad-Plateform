// src/utils/bannerTracker.ts
// Global banner impression tracking to prevent duplicates

class BannerTracker {
    private trackedImpressions = new Set<string>();
    private trackedClicks = new Set<string>();
    private impressionCooldown = new Map<number, number>();

    // Cooldown period in milliseconds (5 minutes)
    private readonly IMPRESSION_COOLDOWN = 5 * 60 * 1000;

    /**
     * Check if an impression should be tracked for a banner
     * Prevents duplicate impressions within the cooldown period
     */
    shouldTrackImpression(bannerId: number, position: string): boolean {
        const key = `${bannerId}-${position}`;
        const now = Date.now();

        // Check if we've already tracked this banner recently
        const lastTracked = this.impressionCooldown.get(bannerId);
        if (lastTracked && (now - lastTracked) < this.IMPRESSION_COOLDOWN) {
            return false;
        }

        // Check if we've already tracked this specific banner-position combination
        if (this.trackedImpressions.has(key)) {
            return false;
        }

        return true;
    }

    /**
     * Mark an impression as tracked
     */
    markImpressionTracked(bannerId: number, position: string): void {
        const key = `${bannerId}-${position}`;
        this.trackedImpressions.add(key);
        this.impressionCooldown.set(bannerId, Date.now());

        // Clean up old entries after cooldown period
        setTimeout(() => {
            this.trackedImpressions.delete(key);
            this.impressionCooldown.delete(bannerId);
        }, this.IMPRESSION_COOLDOWN);
    }

    /**
     * Check if a click should be tracked for a banner
     * Allows multiple clicks but prevents rapid duplicate clicks
     */
    shouldTrackClick(bannerId: number): boolean {
        // Allow clicks but prevent rapid duplicates (within 1 second)
        const recentClicks = Array.from(this.trackedClicks)
            .filter(clickKey => clickKey.startsWith(`${bannerId}-`))
            .map(clickKey => parseInt(clickKey.split('-')[1]))
            .filter(timestamp => (Date.now() - timestamp) < 1000);

        return recentClicks.length === 0;
    }

    /**
     * Mark a click as tracked
     */
    markClickTracked(bannerId: number): void {
        const key = `${bannerId}-${Date.now()}`;
        this.trackedClicks.add(key);

        // Clean up old click entries after 1 minute
        setTimeout(() => {
            this.trackedClicks.delete(key);
        }, 60000);
    }

    /**
     * Reset all tracking (useful for testing or page navigation)
     */
    reset(): void {
        this.trackedImpressions.clear();
        this.trackedClicks.clear();
        this.impressionCooldown.clear();
    }
}

// Export singleton instance
export const bannerTracker = new BannerTracker();