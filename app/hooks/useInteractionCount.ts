import { useState, useEffect } from "react";
import { fetchUserActivities, UserActivity } from "../api/interactions";

// Global state for interaction count
let globalInteractionCount = 0;
let listeners: ((count: number) => void)[] = [];

const notifyListeners = (count: number) => {
  listeners.forEach((listener) => listener(count));
};

export const useInteractionCount = () => {
  const [count, setCount] = useState(globalInteractionCount);

  useEffect(() => {
    // Add listener
    listeners.push(setCount);

    // Cleanup listener on unmount
    return () => {
      const index = listeners.indexOf(setCount);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const refreshCount = async () => {
    try {
      const response = await fetchUserActivities();
      const unreadCount = response.activities.filter(
        (activity) => !activity.isRead,
      ).length;
      globalInteractionCount = unreadCount;
      notifyListeners(unreadCount);
      return unreadCount;
    } catch (error) {
      console.error("Failed to refresh interaction count:", error);
      return 0;
    }
  };

  const markAsRead = (activityIds: string[]) => {
    // This would ideally call an API to mark activities as read
    // For now, we'll just refresh the count
    refreshCount();
  };

  return {
    count,
    refreshCount,
    markAsRead,
  };
};
