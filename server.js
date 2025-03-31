const express = require("express");
const { OpenAI } = require("openai");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const openai = new OpenAI({
  apiKey: "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", // Replace with your actual OpenAI API key
});

app.use(bodyParser.json());
app.use(cors()); // Enable CORS to handle requests from other domains

// Route to generate lyrics
app.post("/generate_lyrics", async (req, res) => {
  try {
    const { mood = "happy" } = req.body; // Default to 'happy' if no mood is provided
    console.log(`🎵 Generating lyrics for mood: ${mood}`);

    // Use OpenAI's chat completions endpoint (adjusting for chat-based models)
    const response = await openai.chat.completions.create({
      model: "gpt-4", // You can use "gpt-4" or "gpt-3.5-turbo" depending on availability
      messages: [
        {
          role: "user",
          content: `Write a song about feeling ${mood} with a chorus and a verse.`,
        },
      ],
    });

    // Extract the generated lyrics
    const lyrics = response.choices[0].message.content.trim();
    console.log(`✅ Lyrics generated successfully:\n${lyrics}`);

    // Send the response back to the client
    return res.json({ lyrics });
  } catch (error) {
    console.error("⚠️ OpenAI API Error:", error);
    return res.status(500).json({
      error: "OpenAI API error",
      details: error.message || "An error occurred while processing the request.",
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


