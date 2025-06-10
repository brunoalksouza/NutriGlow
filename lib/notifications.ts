export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  static async scheduleReminder(title: string, body: string, time: Date) {
    const hasPermission = await this.requestPermission()
    if (!hasPermission) return

    // Calculate delay
    const delay = time.getTime() - Date.now()
    if (delay <= 0) return

    setTimeout(() => {
      new Notification(title, {
        body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "meal-reminder",
        requireInteraction: true,
      })
    }, delay)
  }

  static async scheduleMealReminders(meals: any[]) {
    for (const meal of meals) {
      const [hours, minutes] = meal.time.split(":").map(Number)
      const reminderTime = new Date()
      reminderTime.setHours(hours, minutes, 0, 0)

      // If time has passed today, schedule for tomorrow
      if (reminderTime.getTime() < Date.now()) {
        reminderTime.setDate(reminderTime.getDate() + 1)
      }

      await this.scheduleReminder(
        `Hora do ${meal.name}! 🍽️`,
        `Não esqueça da sua refeição: ${meal.foods.slice(0, 2).join(", ")}...`,
        reminderTime,
      )
    }
  }
}
