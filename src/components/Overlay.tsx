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
    if (player) {
      setTimeout(() => player.pause(), 100);
    }

    const loadNotes = async () => {
      const untimedNote = await NotesService.getUntimed(videoId);
      setNote(untimedNote);
      
      const allNotes = await NotesService.getAll();
      const saved = allNotes[videoId]?.timed || [];

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
    };

    loadNotes();
  }, [videoId]);

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
    const timeout = setTimeout(async () => {
      if (videoId) {
        await NotesService.saveUntimed(videoId, note.trim());
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
    (handleTimedChange as any)._timeout = setTimeout(async () => {
      await NotesService.updateTimedNote(
        videoId,
        updatedNotes[index].timestamp,
        text.trim()
      );
    }, 500);
  };

  const handleDeleteTimed = async (timestamp: number) => {
    if (!videoId) return;
    await NotesService.updateTimedNote(videoId, timestamp, "");
    setTimedNotes((prev) => prev.filter((n) => n.timestamp !== timestamp));
  };

  const dismiss = async () => {
    if (videoId) {
      const cleaned = timedNotes.filter((n) => n.text.trim() !== "");
      for (const n of cleaned) {
        await NotesService.updateTimedNote(videoId, n.timestamp, n.text.trim());
      }
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
        <div className={`px-6 py-4 border-b ${settings.theme ? "border-zinc-700" : "border-zinc-300"} flex items-center justify-between`}>
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
