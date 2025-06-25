import { useEffect, useRef, useState } from "react";
import NotesService, { type TimedNote } from "../lib/notesService";

const WritePad = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    textareaRef.current?.focus();

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

    // scroll focus
    setTimeout(() => {
      const el = document.querySelector(
        `#note-${timestamp} > .smarttube-editor`
      ) as HTMLTextAreaElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    }, 100);

    setTimeout(() => {
      const el = document.getElementById(`note-${timestamp}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
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
        const trimmed = note.trim();
        NotesService.saveUntimed(videoId, trimmed);
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
        // removes from UI if empty; change later ***
        const filtered = updatedNotes.filter(
          (n) => n.timestamp !== note.timestamp
        );
        setTimedNotes(filtered);
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
          {/* untimed */}
          <textarea
            ref={(ref) => {
              textareaRef.current = ref;
              autoResize(ref);
            }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Untimed notes..."
            className="smarttube-editor"
            style={{
              minHeight: "4rem",
              flexShrink: 0,
              zIndex: 1,
              position: "relative",
            }}
          />

          {/* timed blocks */}
          {timedNotes.map((block, idx) => (
            <div
              key={`${block.timestamp}-${idx}`}
              className="smarttube-timed-block"
              id={`note-${block.timestamp}`}
            >
              <div className="smarttube-timestamp">
                {formatTime(block.timestamp)}
              </div>
              <textarea
                ref={(ref) => {
                  textareaRef.current = ref;
                  autoResize(ref);
                }}
                className="smarttube-editor timed"
                placeholder="Write note..."
                value={block.text}
                onChange={(e) => {
                  handleTimedChange(idx, e.target.value);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WritePad;
