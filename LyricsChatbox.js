import { useState, useRef } from "react";

export default function LyricsChatbox() {
  const [mood, setMood] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const speechRef = useRef(null);

  const generateLyrics = async () => {
    if (!mood) return;
    setLoading(true);
    setLyrics("");

    try {
      const response = await fetch("http://localhost:5000/generate_lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      const data = await response.json();
      setLyrics(data.lyrics);

      // Auto-play lyrics with text-to-speech
      speakLyrics(data.lyrics);
    } catch (error) {
      setLyrics("Error generating lyrics. Try again.");
    }
    setLoading(false);
  };

  const speakLyrics = (text) => {
    if (speechRef.current) {
      speechSynthesis.cancel();
    }
    const speech = new SpeechSynthesisUtterance(text);
    speech.volume = volume;
    speech.rate = speechRate;
    speech.pitch = 1;
    speechRef.current = speech;
    speechSynthesis.speak(speech);
  };

  const pauseSpeech = () => {
    speechSynthesis.pause();
  };

  const resumeSpeech = () => {
    speechSynthesis.resume();
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>AI Lyrics Generator</h2>
      <input
        type="text"
        placeholder="Enter your mood (e.g., happy, sad, excited)"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        style={{ padding: "8px", marginBottom: "10px", width: "80%" }}
      />
      <button onClick={generateLyrics} disabled={loading} style={{ padding: "10px", cursor: "pointer" }}>
        {loading ? "Generating..." : "Generate Lyrics"}
      </button>

      {/* Text-to-Speech Controls */}
      {lyrics && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={() => speakLyrics(lyrics)}>Play</button>
          <button onClick={pauseSpeech}>Pause</button>
          <button onClick={resumeSpeech}>Resume</button>
          <button onClick={stopSpeech}>Stop</button>

          <div>
            <label>Speed: </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            />
            <span>{speechRate.toFixed(1)}x</span>
          </div>

          <div>
            <label>Volume: </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
            <span>{(volume * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      <p style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>{lyrics}</p>
    </div>
  );
}
