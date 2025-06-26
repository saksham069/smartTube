import { useEffect, useState } from "react";
import NotesService, { type TimedNote } from "../lib/notesService";
import UntimedNote from "./UntimedNote";
import TimedNoteBlock from "./TimedNote";

const WritePad = () => {
  const [dark, setDark] = useState(false);
  const [note, setNote] = useState("");
  const [timedNotes, setTimedNotes] = useState<TimedNote[]>([]);

  const videoId = NotesService.getVideoId();

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("smarttube-theme");
    if (savedTheme === "dark") setDark(true);

    if (!videoId) return;

    setNote(NotesService.getUntimed(videoId));

    const saved = NotesService.getAll()[videoId]?.timed || [];
    const player = document.querySelector("video") as HTMLVideoElement | null;
    const timestamp = player ? Math.floor(player.currentTime) : 0;

    const exists = saved.find((n) => n.timestamp === timestamp);
    const merged = exists ? saved : [...saved, { timestamp, text: "" }];
    merged.sort((a, b) => a.timestamp - b.timestamp);
    setTimedNotes(merged);

    setTimeout(() => {
      const el = document.querySelector(
        `#note-${timestamp} > .smarttube-editor`
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
  }, [note]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleTimedChange = (index: number, text: string) => {
    const updatedNotes = [...timedNotes];
    const note = updatedNotes[index];
    if (!videoId) return;

    note.text = text;
    setTimedNotes(updatedNotes);

    clearTimeout((handleTimedChange as any)._timeout);
    (handleTimedChange as any)._timeout = setTimeout(() => {
      const trimmed = text.trim();
      if (trimmed === "") {
        NotesService.updateTimedNote(videoId, note.timestamp, "");
        setTimedNotes(
          updatedNotes.filter((n) => n.timestamp !== note.timestamp)
        );
      } else {
        NotesService.updateTimedNote(videoId, note.timestamp, trimmed);
      }
    }, 500);
  };

  const toggleTheme = () => {
    const newTheme = dark ? "light" : "dark";
    setDark(!dark);
    localStorage.setItem("smarttube-theme", newTheme);
  };

  const dismiss = () => {
    document.getElementById("smarttube-overlay-container")?.remove();
  };

  return (
    <div>
      {/* backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "transparent",
        }}
      ></div>

      {/* overlay */}
      <div
        className={`smarttube-overlay ${dark ? "dark" : ""}`}
        id="smarttube-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="smarttube-header">
          <h1 className="smarttube-title">SmartTube Notes</h1>
          <button onClick={toggleTheme} className="smarttube-toggle">
            {dark ? "Light" : "Dark"} Mode
          </button>
        </div>

        <div className="smarttube-editor-container">
          <UntimedNote note={note} setNote={setNote} autoResize={autoResize} />
          {timedNotes.map((block, idx) => (
            <TimedNoteBlock
              key={`${block.timestamp}-${idx}`}
              text={block.text}
              timestamp={block.timestamp}
              idx={idx}
              formatTime={formatTime}
              handleChange={handleTimedChange}
              autoResize={autoResize}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WritePad;
