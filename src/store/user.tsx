import { create } from "zustand";

export interface UserState {
  isLoggedIn: boolean;
  id: string;
  username: string;
  role: string;
  updatedAt: string;
  createdAt: string;
  settings: UserSettings;
  oauth: boolean;
}

interface UserSettings {
  useNewChatPlayer: boolean;
  moreUIDetails: boolean;
}

const useUserStore = create<UserState>((set) => ({
  isLoggedIn: false,
  id: "",
  username: "",
  role: "",
  updatedAt: "",
  createdAt: "",
  settings: {
    useNewChatPlayer: true,
    moreUIDetails: false,
  },
  oauth: false,
  setUser: (user: UserState) => set(user),
}));

const setUserSettings = (settings: UserSettings) => (set, get, store) => {
  store.set.settings(settings);
};

export default useUserStore;
