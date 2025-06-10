interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
}

class Analytics {
  private static instance: Analytics
  private events: AnalyticsEvent[] = []

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "",
      },
    }

    this.events.push(analyticsEvent)

    // In a real app, you'd send this to your analytics service
    console.log("Analytics Event:", analyticsEvent)

    // Keep only last 100 events to prevent memory issues
    if (this.events.length > 100) {
      this.events = this.events.slice(-100)
    }
  }

  // Common events
  trackDietGenerated(formData: any): void {
    this.track("diet_generated", {
      goal: formData.goal,
      age: formData.age,
      activity_level: formData.activityLevel,
      has_restrictions: !!formData.restrictions,
    })
  }

  trackSubscriptionStarted(): void {
    this.track("subscription_started")
  }

  trackPageView(page: string): void {
    this.track("page_view", { page })
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }
}

export const analytics = Analytics.getInstance()
