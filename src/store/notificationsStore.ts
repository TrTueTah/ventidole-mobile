import { create } from 'zustand';

interface NotificationsState {
  notificationsCount: number;
  setNotificationsCount: (count: number) => void;
  incrementNotificationsCount: () => void;
  decrementNotificationsCount: () => void;
  resetNotificationsCount: () => void;
}

export const useNotifications = create<NotificationsState>(set => ({
  notificationsCount: 0,

  setNotificationsCount: (count: number) => set({ notificationsCount: count }),

  incrementNotificationsCount: () =>
    set(state => ({ notificationsCount: state.notificationsCount + 1 })),

  decrementNotificationsCount: () =>
    set(state => ({
      notificationsCount: Math.max(0, state.notificationsCount - 1),
    })),

  resetNotificationsCount: () => set({ notificationsCount: 0 }),
}));
