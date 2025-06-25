export interface TimedNote {
  timestamp: number; // in seconds
  text: string;
}

export interface SmartTubeNotes {
  [videoId: string]: {
    untimed: string;
    timed: TimedNote[];
  };
}

const STORAGE_KEY = "smarttube-notes";

const NotesService = {
  getAll(): SmartTubeNotes {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveAll(notes: SmartTubeNotes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },

  getVideoId(): string | null {
    return new URLSearchParams(window.location.search).get("v");
  },

  getUntimed(videoId: string): string {
    return this.getAll()[videoId]?.untimed || "";
  },

  saveUntimed(videoId: string, content: string) {
    const all = this.getAll();
    all[videoId] ??= { untimed: "", timed: [] };
    all[videoId].untimed = content;
    this.saveAll(all);
  },

  addTimedNote(videoId: string, note: TimedNote) {
    const all = this.getAll();
    all[videoId] ??= { untimed: "", timed: [] };
    all[videoId].timed.push(note);
    this.saveAll(all);
  },

  updateTimedNote(videoId: string, timestamp: number, newText: string) {
    const all = this.getAll();
    all[videoId] ??= { untimed: "", timed: [] };

    const index = all[videoId].timed.findIndex(
      (n) => n.timestamp === timestamp
    );

    if (newText.trim() === "") {
      // delete note if empty
      if (index !== -1) all[videoId].timed.splice(index, 1);
    } else {
      if (index !== -1) {
        all[videoId].timed[index].text = newText;
      } else {
        all[videoId].timed.push({ timestamp, text: newText });
      }
    }

    this.saveAll(all);
  },
};

export default NotesService;
