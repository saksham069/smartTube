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

const SETTINGS_KEY = "smarttube-settings";

const SettingsService = {
  get(): Settings {
    const raw = localStorage.getItem(SETTINGS_KEY);
    try {
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  update(key: string, value: boolean) {
    const current = SettingsService.get();
    const updated = { ...current, [key]: value };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));

    // notify listeners
    window.dispatchEvent(
      new CustomEvent("smarttube-settings-changed", { detail: updated })
    );
  },

  initDefaults() {
    const existing = localStorage.getItem(SETTINGS_KEY);
    if (!existing) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    }
  },
};

export default SettingsService;
