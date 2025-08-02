import { useEffect, useRef, useState } from "react";
import UntimedNote from "./UntimedNote";
import TimedNoteBlock from "./TimedNote";
import NotesService, { type ITimedNote } from "../lib/notesService";
import SettingsService from "../lib/settingsService";
import Toggle from "./Toggle";

const Overlay = () => {
  const [note, setNote] = useState("");
  const [timedNotes, setTimedNotes] = useState<ITimedNote[]>([]);
  const [settings, setSettings] = useState(() => SettingsService.get());
  const [dark, setDark] = useState(false);
  const [blurBg, setBlurBg] = useState(false);
  const [pauseVideo, setPauseVideo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const videoId = NotesService.getVideoId();

  // load settings from storage
  useEffect(() => {
    const settings = SettingsService.get();
    setDark(settings.theme);
    setBlurBg(settings.blur);
    setPauseVideo(settings.pause);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSettingChange = (
    key: string,
    value: boolean
  ) => {
    SettingsService.update(key, value);

    if (key === "theme") {
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
    } finally {
      dismiss();
    }
  };

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    const onSettingsChange = (e: any) => {
      const newSettings = e.detail;
      setSettings(newSettings);
    };

    window.addEventListener("smarttube-settings-changed", onSettingsChange);
    return () =>
      window.removeEventListener("smarttube-settings-changed", onSettingsChange);
  }, []);


  useEffect(() => {
    if (!videoId) return;

    const player = document.querySelector("video") as HTMLVideoElement | null;
    if (player && settings.pause) {
      setTimeout(() => player.pause(), 100);
    }

    setNote(NotesService.getUntimed(videoId));
    const saved = NotesService.getAll()[videoId]?.timed || [];

    const timestamp = player ? Math.floor(player.currentTime) : 0;
    const exists = saved.find((n) => n.timestamp === timestamp);
    const merged = exists ? saved : [...saved, { timestamp, text: "" }];
    merged.sort((a, b) => a.timestamp - b.timestamp);
    setTimedNotes(merged);

    setTimeout(() => {
      const el = document.querySelector(
        `#note-${timestamp} textarea`
      ) as HTMLTextAreaElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    }, 100);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);


  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.getElementById("smarttube-overlay-container")) dismiss();
      }
    };
    window.addEventListener("keydown", escHandler);
    return () => window.removeEventListener("keydown", escHandler);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (videoId) {
        NotesService.saveUntimed(videoId, note.trim());
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [note, videoId]);

  const handleTimedChange = (index: number, text: string) => {
    if (!videoId) return;
    const updatedNotes = [...timedNotes];
    updatedNotes[index].text = text;
    setTimedNotes(updatedNotes);

    clearTimeout((handleTimedChange as any)._timeout);
    (handleTimedChange as any)._timeout = setTimeout(() => {
      NotesService.updateTimedNote(
        videoId,
        updatedNotes[index].timestamp,
        text.trim()
      );
    }, 500);
  };

  const handleDeleteTimed = (timestamp: number) => {
    if (!videoId) return;
    NotesService.updateTimedNote(videoId, timestamp, "");
    setTimedNotes((prev) => prev.filter((n) => n.timestamp !== timestamp));
  };

  const dismiss = () => {
    if (videoId) {
      const cleaned = timedNotes.filter((n) => n.text.trim() !== "");
      cleaned.forEach((n) =>
        NotesService.updateTimedNote(videoId, n.timestamp, n.text.trim())
      );
    }

    document.body.style.overflow = "auto";

    // resume video 
    const player = document.querySelector("video") as HTMLVideoElement | null;
    if (player && settings.pause) {
      player.play();
    }

    document.getElementById("smarttube-overlay-container")?.remove();
  };


  const backdropStyle = {
    position: "fixed" as const,
    inset: 0,
    zIndex: 9998,
    background: settings.blur ? "rgba(0, 0, 0, 0.4)" : "transparent",
    backdropFilter: settings.blur ? "blur(6px)" : "none",
    WebkitBackdropFilter: settings.blur ? "blur(6px)" : "none",
  };

  const formatTime = (s: number) => {
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    return hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  };


  return (
    <>
      <div onClick={dismiss} style={backdropStyle} />
      <div
        className={`fixed top-[5%] left-[5%] w-[90%] h-[90%] z-[9999] ${settings.theme ? "bg-zinc-900 text-zinc-200 border-zinc-700" : "bg-white text-black border-zinc-300"} rounded-xl border shadow-2xl flex flex-col overflow-hidden text-[15px]`}
        id="smarttube-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-6 py-4 border-b ${settings.theme ? "border-zinc-700" : "border-zinc-300"
            } flex items-center justify-between relative`}
        >
          <h1 className="text-4xl font-bold">SmartTube Notes</h1>

          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings((prev) => !prev)}
              className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              title="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {showSettings && (
              <div
                className={`absolute right-0 mt-2 w-96 rounded-xl shadow-lg z-50 transition-all duration-300 ease-out
          ${dark ? "bg-zinc-800 text-white border border-zinc-700" : "bg-white text-black border border-zinc-200"}`}
              >
                <div className="p-6 space-y-6 text-xl">
                  <Toggle
                    label="Blur background"
                    checked={blurBg}
                    onChange={(val) => handleSettingChange("blur", val)}
                  />
                  <Toggle
                    label="Pause video"
                    checked={pauseVideo}
                    onChange={(val) => handleSettingChange("pause", val)}
                  />
                  <Toggle
                    label="Dark mode"
                    checked={dark}
                    onChange={(val) => handleSettingChange("theme", val)}
                  />
                  <div className={`pt-4 space-y-2 border-t border-zinc-700`}>
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                      Export Notes
                    </button>

                    <label className={`block w-full text-center px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 cursor-pointer`}>
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
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <UntimedNote note={note} setNote={setNote} autoResize={autoResize} />
          {timedNotes.map((block, idx) => (
            <TimedNoteBlock
              key={`${block.timestamp}-${idx}`}
              text={block.text}
              timestamp={block.timestamp}
              idx={idx}
              formatTime={formatTime}
              handleChange={handleTimedChange}
              handleDelete={handleDeleteTimed}
              autoResize={autoResize}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Overlay;
