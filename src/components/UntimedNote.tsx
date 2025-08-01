import { useEffect, useRef, useState } from "react";
import SettingsService from "../lib/settingsService";


type Props = {
  note: string;
  setNote: (val: string) => void;
  autoResize: (el: HTMLTextAreaElement | null) => void;
};

const UntimedNote = ({ note, setNote, autoResize }: Props) => {
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
    if (ref.current) {
      ref.current.focus();
      autoResize(ref.current);
    }
  }, []);

  return (
    <textarea
      ref={(el) => {
        ref.current = el;
        autoResize(el);
      }}
      value={note}
      onChange={(e) => {
        setNote(e.target.value);
        autoResize(e.target);
      }}
      placeholder="General notes for this video..."
      className={`w-full text-xl font-normal leading-relaxed ${settings.theme ? "text-zinc-100 bg-zinc-800/90 border-zinc-700" : "text-zinc-800 bg-zinc-100 border-zinc-300"}  border rounded-xl px-6 py-5 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow`}
    />
  );
};

export default UntimedNote;
