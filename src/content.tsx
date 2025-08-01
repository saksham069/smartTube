import ReactDOM from "react-dom/client";
import Overlay from "./components/Overlay";
import SettingsService from "./lib/settingsService";
import "../popup/index.css";

// if gonna change svg, fix styling in index.css
const iconSVG = `
  <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#fff"/>
    <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#fff"/>
  </svg>
`;

function mountOverlay() {
  const container = document.createElement("div");
  container.id = "smarttube-overlay-container";
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(<Overlay />);
}

function injectNoteIcon() {
  if (document.getElementById("smarttube-note-button")) return;

  const controlBar = document.querySelector(".ytp-right-controls");
  if (!controlBar) {
    setTimeout(injectNoteIcon, 500);
    return;
  }

  const btn = document.createElement("button");
  btn.id = "smarttube-note-button";
  btn.className = "ytp-button";
  btn.title = "SmartTube Notes";
  btn.innerHTML = iconSVG;

  btn.onclick = mountOverlay;

  controlBar.insertBefore(btn, controlBar.firstChild);
}

SettingsService.initDefaults();
injectNoteIcon();

// toggle overlay on "n" key press (only when not typing)
window.addEventListener("keydown", (e) => {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
  const editable = (e.target as HTMLElement)?.isContentEditable;
  if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
    if (tag !== "input" && tag !== "textarea" && !editable) {
      e.preventDefault();
      mountOverlay();
    }
  }
});
