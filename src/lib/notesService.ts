export interface ITimedNote {
  timestamp: number; // in seconds
  text: string;
}

export interface ISmartTubeNotes {
  [videoId: string]: {
    untimed: string;
    timed: ITimedNote[];
  };
}

const STORAGE_KEY = "smarttube-notes";

// Helper to determine if we're in popup context
const isPopupContext = () => {
  return typeof chrome !== 'undefined' && chrome.storage;
};

// Storage wrapper that works in both popup and content script contexts
const StorageWrapper = {
  async get(key: string): Promise<any> {
    if (isPopupContext()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key]);
        });
      });
    } else {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
  },

  async set(key: string, value: any): Promise<void> {
    if (isPopupContext()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      });
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }
};

const NotesService = {
  async getAll(): Promise<ISmartTubeNotes> {
    try {
      const raw = await StorageWrapper.get(STORAGE_KEY);
      return raw || {};
    } catch {
      return {};
    }
  },

  async saveAll(notes: ISmartTubeNotes) {
    await StorageWrapper.set(STORAGE_KEY, notes);
  },

  getVideoId(): string | null {
    return new URLSearchParams(window.location.search).get("v");
  },

  async getUntimed(videoId: string): Promise<string> {
    const all = await this.getAll();
    return all[videoId]?.untimed || "";
  },

  async saveUntimed(videoId: string, content: string) {
    const all = await this.getAll();
    all[videoId] ??= { untimed: "", timed: [] };
    all[videoId].untimed = content;
    await this.saveAll(all);
  },

  async addTimedNote(videoId: string, note: ITimedNote) {
    const all = await this.getAll();
    all[videoId] ??= { untimed: "", timed: [] };
    all[videoId].timed.push(note);
    await this.saveAll(all);
  },

  async updateTimedNote(videoId: string, timestamp: number, newText: string) {
    const all = await this.getAll();
    all[videoId] ??= { untimed: "", timed: [] };

    const index = all[videoId].timed.findIndex(
      (n) => n.timestamp === timestamp
    );

    if (newText.trim() === "") {
      // delete note if empty
      if (index !== -1) all[videoId].timed.splice(index, 1);
    } else {
      if (index !== -1) {
        all[videoId].timed[index].text = newText;
      } else {
        all[videoId].timed.push({ timestamp, text: newText });
      }
    }

    await this.saveAll(all);
  },

  async importAll(data: Record<string, { untimed: string; timed: ITimedNote[] }>) {
    try {
      const current = await this.getAll();
      Object.keys(data).forEach((videoId) => {
        current[videoId] = data[videoId];
      });
      await this.saveAll(current);
    } catch (e) {
      console.error("Import failed", e);
    }
  },
};

const SETTINGS_KEY = "smarttube-settings";

type Settings = {
  theme: boolean;
  blur: boolean;
  pause: boolean;
};

const defaultSettings: Settings = {
  theme: false,
  blur: false,
  pause: false,
};

const SettingsService = {
  async initDefaults() {
    const raw = await StorageWrapper.get(SETTINGS_KEY);
    if (!raw) {
      await StorageWrapper.set(SETTINGS_KEY, defaultSettings);
    }
  },

  async get(): Promise<Settings> {
    const raw = await StorageWrapper.get(SETTINGS_KEY);
    if (raw) {
      try {
        return raw;
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  },

  async set(newSettings: Settings) {
    await StorageWrapper.set(SETTINGS_KEY, newSettings);
    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('smarttube-settings-changed', { 
      detail: newSettings 
    }));
  },

  async update<K extends keyof Settings>(key: K, value: boolean) {
    const current = await this.get();
    current[key] = value;
    await this.set(current);
    console.log(current);
  },
};

export default {
  ...NotesService,
  settings: SettingsService,
};
