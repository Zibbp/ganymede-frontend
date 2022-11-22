import create from "zustand";

interface UserState {
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
  },
  oauth: false,
  setUser: (user: UserState) => set(user),
}));

const setUserSettings = (settings: UserSettings) => (set, get, store) => {
  store.set.settings(settings);
};

export default useUserStore;
