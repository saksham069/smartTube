import { useEffect, useState } from "react";
import NotesService from "./lib/notesService";
import Toggle from "./components/Toggle";

const App = () => {
  const [dark, setDark] = useState(false);
  const [blurBg, setBlurBg] = useState(false);
  const [pauseVideo, setPauseVideo] = useState(false);

  useEffect(() => {
    const darkStored = localStorage.getItem("smarttube-theme") === "true";
    const blurStored = localStorage.getItem("smarttube-blur") === "true";
    const pauseStored = localStorage.getItem("smarttube-pause") === "true";

    setDark(darkStored);
    setBlurBg(blurStored);
    setPauseVideo(pauseStored);

    document.documentElement.classList.toggle("dark", darkStored);
  }, []);

  const updateSetting = (
    key: string,
    value: boolean,
    setState: (val: boolean) => void
  ) => {
    localStorage.setItem(key, value.toString());
    setState(value);

    if (key === "smarttube-theme") {
      document.documentElement.classList.toggle("dark", value);
    }
  };

  const handleExport = () => {
    const data = NotesService.getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smarttube-notes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
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
          onChange={(val) => updateSetting("smarttube-blur", val, setBlurBg)}
        />
        <Toggle
          label="Pause video on overlay"
          checked={pauseVideo}
          onChange={(val) =>
            updateSetting("smarttube-pause", val, setPauseVideo)
          }
        />
        <Toggle
          label="Dark Mode"
          checked={dark}
          onChange={(val) => updateSetting("smarttube-theme", val, setDark)}
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
