import { useRef, useEffect } from "react";

type Props = {
  text: string;
  timestamp: number;
  idx: number;
  formatTime: (ts: number) => string;
  handleChange: (index: number, value: string) => void;
  autoResize: (el: HTMLTextAreaElement | null) => void;
};

const TimedNoteBlock = ({
  text,
  timestamp,
  idx,
  formatTime,
  handleChange,
  autoResize,
}: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) autoResize(ref.current);
  }, [text]);

  return (
    <div className="smarttube-timed-block" id={`note-${timestamp}`}>
      <div className="smarttube-timestamp">{formatTime(timestamp)}</div>
      <textarea
        ref={(el) => {
          ref.current = el;
          autoResize(el);
        }}
        className="smarttube-editor timed"
        placeholder="Write note..."
        value={text}
        onChange={(e) => handleChange(idx, e.target.value)}
      />
    </div>
  );
};

export default TimedNoteBlock;
