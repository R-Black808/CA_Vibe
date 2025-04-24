import React, { useState, useEffect } from 'react';
import { Music2, Mic, Volume2, RefreshCw, Sparkles } from 'lucide-react';
import OpenAI from 'openai';

const moods = [
  'Happy', 'Sad', 'Energetic', 'Romantic', 'Chill',
  'Angry', 'Nostalgic', 'Hopeful', 'Mysterious', 'Peaceful'
];

const genres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country',
  'Jazz', 'Blues', 'Electronic', 'Folk', 'Latin'
];

function App() {
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const generateLyrics = async () => {
    if (!mood || !genre) return;
    
    setIsGenerating(true);
    try {
      const openai = new OpenAI({
        apiKey: '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',
        baseURL: 'https://api.openai.com/v1',
        dangerouslyAllowBrowser: true
      });

      const completion = await openai.chat.completions.create({
        messages: [{
          role: "system",
          content: `You are a professional songwriter. Write a complete song in the ${genre} genre that captures a ${mood} mood. Include:
          1. A title
          2. Verses (2-3)
          3. A chorus (repeated 2-3 times)
          4. A bridge (optional)
          
          Format the song with clear section labels and line breaks. Make it sound authentic to the ${genre} genre.`
        }],
        model: "gpt-3.5-turbo",
      });

      setLyrics(completion.choices[0].message.content || '');
    } catch (error) {
      console.error('Error generating lyrics:', error);
      setLyrics('Failed to generate lyrics. Please try again.');
    }
    setIsGenerating(false);
  };

  const speakLyrics = () => {
    if (!lyrics || !selectedVoice) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lyrics);
    utterance.voice = selectedVoice;
    utterance.onend = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center mb-12">
          <Music2 className="w-10 h-10 mr-4" />
          <h1 className="text-4xl font-bold">Catch-a-Vibe</h1>
        </div>

        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Select a Mood</h2>
              <div className="grid grid-cols-2 gap-3">
                {moods.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`p-3 rounded-lg transition-all ${
                      mood === m
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 hover:bg-white/20'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Select a Genre</h2>
              <div className="grid grid-cols-2 gap-3">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className={`p-3 rounded-lg transition-all ${
                      genre === g
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 hover:bg-white/20'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generateLyrics}
            disabled={!mood || !genre || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-8"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Complete Song...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate {genre} Song
              </>
            )}
          </button>

          {lyrics && (
            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed">{lyrics}</pre>
            </div>
          )}

          {lyrics && (
            <div className="flex flex-col md:flex-row gap-4">
              <select
                className="bg-white/10 rounded-lg px-4 py-2 flex-grow"
                onChange={(e) => setSelectedVoice(voices[parseInt(e.target.value)])}
              >
                {voices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name}
                  </option>
                ))}
              </select>

              <button
                onClick={isPlaying ? stopSpeaking : speakLyrics}
                className="bg-purple-600 hover:bg-purple-700 py-2 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Volume2 className="w-5 h-5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Read Aloud
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;