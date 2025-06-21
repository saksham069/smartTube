import { useEffect, useRef, useState } from "react";

const WritePad = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
    const savedTheme = localStorage.getItem("smarttube-theme");
    if (savedTheme === "dark") setDark(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = dark ? "light" : "dark";
    setDark(!dark);
    localStorage.setItem("smarttube-theme", newTheme);
  };

  return (
    <div
      className={`fixed top-[10%] left-[10%] w-[80%] h-[80%] z-[9999] rounded-xl shadow-2xl p-4 overflow-auto border transition-all ${
        dark
          ? "bg-zinc-900 text-white border-zinc-700"
          : "bg-[#fefefe] text-black border-zinc-300"
      }`}
      id="smarttube-overlay"
    >
      <div className="flex justify-between mb-2">
        <h1 className="text-lg font-semibold">SmartTube Notes</h1>
        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded bg-zinc-700 text-white dark:bg-zinc-300 dark:text-black"
        >
          {dark ? "Light" : "Dark"} Mode
        </button>
      </div>
      <textarea
        ref={textareaRef}
        placeholder="Start typing your notes..."
        className={`w-full h-[90%] resize-none outline-none border-none bg-transparent text-base placeholder:text-zinc-400 ${
          dark ? "text-white" : "text-black"
        }`}
        style={{
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      />
    </div>
  );
};

export default WritePad;
