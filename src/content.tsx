import ReactDOM from "react-dom/client";
import WritePad from "./components/writePad";
import "../popup/index.css";

function mountWritePad() {
  const existing = document.getElementById("smarttube-overlay-container");
  if (existing) {
    existing.remove();
    return;
  }

  const container = document.createElement("div");
  container.id = "smarttube-overlay-container";
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(<WritePad />);
}

function injectNoteIcon() {
  if (document.getElementById("smarttube-note-button")) return;

  const btn = document.createElement("button");
  btn.id = "smarttube-note-button";
  btn.innerHTML = "📝";
  btn.title = "Take Notes with SmartTube";

  Object.assign(btn.style, {
    position: "absolute",
    bottom: "90px",
    right: "20px",
    zIndex: "99999",
    fontSize: "20px",
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#fff",
    cursor: "pointer",
  });

  btn.onclick = mountWritePad;
  document.body.appendChild(btn);
}

injectNoteIcon();
