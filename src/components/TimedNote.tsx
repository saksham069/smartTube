import { useRef, useEffect } from "react";

type Props = {
  text: string;
  timestamp: number;
  idx: number;
  formatTime: (ts: number) => string;
  handleChange: (index: number, value: string) => void;
  handleDelete: (timestamp: number) => void;
  autoResize: (el: HTMLTextAreaElement | null) => void;
};

const TimedNoteBlock = ({
  text,
  timestamp,
  idx,
  formatTime,
  handleChange,
  handleDelete,
  autoResize,
}: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) autoResize(ref.current);
  }, [text]);

  const DeleteIcon = ({ size = 20, color = "red" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill={color}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
    </svg>
  );

  return (
    <div className="smarttube-timed-block" id={`note-${timestamp}`}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="smarttube-timestamp">{formatTime(timestamp)}</div>
        <button
          onClick={() => handleDelete(timestamp)}
          style={{
            background: "transparent",
            border: "none",
            color: "red",
            fontWeight: "bold",
            fontSize: "1.1rem",
            cursor: "pointer",
            padding: "0 0.5rem",
          }}
          title="Delete this note"
        >
          <DeleteIcon size={18} color="crimson" />
        </button>
      </div>
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
