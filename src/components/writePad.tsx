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

  // esc closes overlay
  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document.getElementById("smarttube-overlay-container")?.remove();
      }
    };
    window.addEventListener("keydown", escHandler);
    return () => window.removeEventListener("keydown", escHandler);
  }, []);

  const dismiss = () => {
    document.getElementById("smarttube-overlay-container")?.remove();
  };

  const toggleTheme = () => {
    const newTheme = dark ? "light" : "dark";
    setDark(!dark);
    localStorage.setItem("smarttube-theme", newTheme);
  };

  return (
    <div>
      {/* backdrop div */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "transparent",
        }}
      ></div>

      {/* notes overlay */}
      <div
        className={`smarttube-overlay ${dark ? "dark" : ""}`}
        id="smarttube-overlay"
        onClick={(e) => e.stopPropagation()} // prevent dismissal on clicking inside
      >
        <div className="smarttube-header">
          <h1 className="smarttube-title">SmartTube Notes</h1>
          <button onClick={toggleTheme} className="smarttube-toggle">
            {dark ? "Light" : "Dark"} Mode
          </button>
        </div>

        <div className="smarttube-editor-container">
          <textarea
            ref={textareaRef}
            placeholder="Start writing your genius..."
            className="smarttube-editor"
          />
        </div>
      </div>
    </div>
  );
};

export default WritePad;
