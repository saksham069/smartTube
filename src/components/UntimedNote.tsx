import { useEffect, useRef } from "react";

type Props = {
  note: string;
  setNote: (val: string) => void;
  autoResize: (el: HTMLTextAreaElement | null) => void;
};

const UntimedNote = ({ note, setNote, autoResize }: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

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
      className="w-full text-xl font-normal leading-relaxed text-zinc-800 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 rounded-xl px-6 py-5 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow"
    />
  );
};

export default UntimedNote;
