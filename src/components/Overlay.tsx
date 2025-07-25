import { useEffect, useState } from "react";
import UntimedNote from "./UntimedNote";
import TimedNoteBlock from "./TimedNote";
import NotesService, { type ITimedNote } from "../lib/notesService";
import SettingsService from "../lib/settingsService";

const Overlay = () => {
  const [note, setNote] = useState("");
  const [timedNotes, setTimedNotes] = useState<ITimedNote[]>([]);
  const [settings, setSettings] = useState(() => SettingsService.get());
  const videoId = NotesService.getVideoId();

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    const applyTheme = (theme: boolean) => {
      document.documentElement.classList.remove("dark");
      if (theme) document.documentElement.classList.add("dark");
    };

    applyTheme(settings.theme); // on mount

    const onSettingsChange = (e: any) => {
      const newSettings = e.detail;
      setSettings(newSettings);
      applyTheme(newSettings.theme); // on change
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
        document.getElementById("smarttube-overlay-container")?.remove();
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
        className="fixed top-[5%] left-[5%] w-[90%] h-[90%] z-[9999] bg-white dark:bg-zinc-900 text-black dark:text-zinc-200 rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-2xl flex flex-col overflow-hidden text-[15px]"
        id="smarttube-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-300 dark:border-zinc-700 flex items-center justify-between">
          <h1 className="text-2xl font-bold">SmartTube Notes</h1>
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
