import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id: string;
  type: 'booking' | 'reminder' | 'system';
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  createdAt: number;
}

interface NotificationsState {
  notifications: AppNotification[];
  isLoaded: boolean;
  loadNotifications: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  getUnreadCount: () => number;
}

const STORAGE_KEY = '@aura_notifications_store_v1';

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  isLoaded: false,

  loadNotifications: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          set({ notifications: parsed, isLoaded: true });
          return;
        }
      }
      set({ notifications: [], isLoaded: true });
    } catch {
      set({ notifications: [], isLoaded: true });
    }
  },

  clearAllNotifications: async () => {
    set({ notifications: [] });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.warn('Failed to clear notifications:', e);
    }
  },

  markAllAsRead: async () => {
    const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to mark notifications as read:', e);
    }
  },

  addNotification: async (notif) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      isRead: false,
    };
    const updated = [newNotif, ...get().notifications];
    set({ notifications: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save notification:', e);
    }
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.isRead).length;
  },
}));
