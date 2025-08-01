import { useRef, useEffect, useState } from "react";
import SettingsService from "../lib/settingsService";

type Props = {
  text: string;
  timestamp: number;
  idx: number;
  formatTime: (ts: number) => string;
  handleChange: (index: number, value: string) => void;
  handleDelete: (timestamp: number) => void;
  autoResize: (el: HTMLTextAreaElement | null) => void;
};

const TimedNote = ({
  text,
  timestamp,
  idx,
  formatTime,
  handleChange,
  handleDelete,
  autoResize,
}: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const [settings, setSettings] = useState(() => SettingsService.get());

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
    if (ref.current) autoResize(ref.current);
  }, [text]);

  const handlePlay = () => {
    const player = document.querySelector("video") as HTMLVideoElement | null;
    if (player) {
      player.currentTime = timestamp;
      player.play();
    }
  };

  return (
    <div
      id={`note-${timestamp}`}
      className={`${settings.theme ? "bg-zinc-800/80 border-zinc-700" : "bg-zinc-100 border-zinc-300"} border rounded-xl p-6 shadow-md transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePlay}
          title="Jump to timestamp"
          className={`${settings.theme ? "text-blue-400" : "text-blue-600"} font-medium text-lg hover:underline`}
        >
          ▶ {formatTime(timestamp)}
        </button>

        <button
          onClick={() => handleDelete(timestamp)}
          title="Delete note"
          className="text-red-500 hover:text-red-600 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
          </svg>
        </button>
      </div>

      <textarea
        ref={(el) => {
          ref.current = el;
          autoResize(el);
        }}
        value={text}
        placeholder="Add a timestamped note..."
        onChange={(e) => handleChange(idx, e.target.value)}
        className={`w-full text-lg font-normal leading-relaxed ${settings.theme ? "text-zinc-100 bg-zinc-900/90 border-zinc-700" : "text-zinc-800 bg-white border-zinc-300"} border rounded-lg px-5 py-4 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all`}
      />
    </div>
  );
};

export default TimedNote;
