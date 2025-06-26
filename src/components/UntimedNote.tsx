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
      placeholder="Untimed notes..."
      className="smarttube-editor"
      style={{
        minHeight: "4rem",
        flexShrink: 0,
        zIndex: 1,
        position: "relative",
      }}
    />
  );
};

export default UntimedNote;
