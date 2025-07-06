import { useEffect, useState } from "react";
import NotesService from "./lib/notesService";
import Toggle from "./components/Toggle";
import SettingsService from "./lib/settingsService";

const App = () => {
  const [dark, setDark] = useState(false);
  const [blurBg, setBlurBg] = useState(false);
  const [pauseVideo, setPauseVideo] = useState(false);

  // load settings from storage
  useEffect(() => {
    console.log("mounting")
    const settings = SettingsService.get();
    setDark(settings.theme);
    setBlurBg(settings.blur);
    setPauseVideo(settings.pause);
    document.documentElement.classList.remove("dark");
    if (settings.theme) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSettingChange = (
    key: "theme" | "blur" | "pause",
    value: boolean
  ) => {
    SettingsService.update(key, value);
    if (key === "theme") {
      document.documentElement.classList.remove("dark");
      if (value) {
        document.documentElement.classList.add("dark");
      }
      setDark(value);
    } else if (key === "blur") {
      setBlurBg(value);
    } else if (key === "pause") {
      setPauseVideo(value);
    }
  };

  const handleExport = () => {
    const videoId = NotesService.getVideoId();
    if (!videoId) {
      alert("No video ID found. Make sure you're on a YouTube video page.");
      return;
    }

    const allNotes = NotesService.getAll();
    const currentVideoNotes = allNotes[videoId];

    if (!currentVideoNotes) {
      alert("No notes found for this video.");
      return;
    }

    const singleVideoData = { [videoId]: currentVideoNotes };
    const blob = new Blob([JSON.stringify(singleVideoData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smarttube-notes-${videoId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const videoIds = Object.keys(data);

      if (videoIds.length !== 1) {
        alert("Invalid file format. File should contain notes for exactly one video.");
        return;
      }

      NotesService.importAll(data);
      alert("Notes imported!");
    } catch {
      alert("Invalid JSON file.");
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6 w-80 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-inter">
      <h1 className="text-xl font-semibold">SmartTube Settings</h1>
      <hr className="border-zinc-300 dark:border-zinc-700 -mt-1 mb-4" />

      <div className="space-y-4">
        <Toggle
          label="Blur background on overlay"
          checked={blurBg}
          onChange={(val) => handleSettingChange("blur", val)}
        />
        <Toggle
          label="Pause video on overlay"
          checked={pauseVideo}
          onChange={(val) => handleSettingChange("pause", val)}
        />
        <Toggle
          label="Dark Mode"
          checked={dark}
          onChange={(val) => handleSettingChange("theme", val)}
        />
      </div>

      <div className="pt-4 space-y-2 border-t border-zinc-300 dark:border-zinc-700">
        <button
          onClick={handleExport}
          className="w-full px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Export Notes
        </button>

        <label className="block w-full text-center text-sm px-4 py-2 bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 cursor-pointer">
          Import Notes
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={handleImport}
          />
        </label>
      </div>
    </div>
  );
};

export default App;
