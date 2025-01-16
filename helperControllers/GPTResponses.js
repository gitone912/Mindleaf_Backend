require("dotenv").config();
const OpenAI = require("openai");
const { getPrompt } = require("./system"); // Assuming system.js is in the same directory

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1. Get Greetings
const getGreetings = async (req, res) => {
  const { language, voice, firstname } = req.body;

  if (!language || !voice) {
    return res.status(400).json({ error: "Language and voice are required." });
  }

  const prompt = `You are ${voice}, In language ${language}, send a random greeting like this - Hi ${firstname}, I'm ${voice}. Audiosmith's mental health and journaling companion. How do you feel today? Use only ${language} for the response. use your name as ${voice} and users name as ${firstname}.`;

  try {
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
    });

    const greeting = response.choices[0]?.message?.content || "Hello!";
    res.json({ greeting });
  } catch (error) {
    console.error("Error generating greeting:", error);
    res.status(500).json({ error: "Failed to generate greeting." });
  }
};

// 2. Send Message
const sendMessage = async (req, res) => {
  const { voice, language, chatInput, firstName, History } = req.body;

  if (
    !voice ||
    !language ||
    !chatInput ||
    !firstName ||
    !Array.isArray(History)
  ) {
    return res
      .status(400)
      .json({ error: "Voice, language, and chatInput are required." });
  }
  const VOICE = voice;
  const systemPrompt = getPrompt(VOICE, language);
  // console.log('systemPrompt', systemPrompt);

  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Respond in ${language} language only. ${systemPrompt} name of user is ${firstName}`,
        },
        { role: "user", content: `Chat History: ${History.join("\n")}` },
        { role: "user", content: chatInput },
      ],
      model: "gpt-4",
    });

    const aiResponse =
      response.choices[0]?.message?.content ||
      "Sorry, I could not reply, there might be some overload on server. please try later in some time";
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to process the message." });
  }
};

// 3. Compile Journal
const compileJournal = async (req, res) => {
  const { language, chatHistory } = req.body;

  if (!language || !Array.isArray(chatHistory)) {
    return res
      .status(400)
      .json({ error: "Language and chatHistory are required." });
  }

  const journalPrompt = `use this langauge ${language} and Based on the chat history , act as a personal journal assistant who writes journal entry in user's behalf. Focus exclusively on translating the user’s confirmed answers, emotions, and reflections into a natural narrative that reflects their day. Do not infer or assume details not provided by the user. Ensure the tone is personal, introspective, and authentic, as though the user is recording their own private journal. Do not introduce any events or emotions unless the user has directly referenced them. Only include thoughts, feelings, and points confirmed by the user. Remove dialogue structure, but maintain the essence of the user’s emotions and insights. Avoid adding or imagining details beyond what has been explicitly stated by the user.  Do not mention the date of the journal. Make it a full blown journal entry. Do not add things the user didn't say or imply. Write in a length of about 2,000 characters in several pargaraphs in ${language}. It should be like this everytime. Not random. Do not make it sound poetic. Just a normal journal entry written by a real human.`;

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: journalPrompt },
        { role: "user", content: `Chat History: ${chatHistory.join("\n")}` },
      ],
      model: "gpt-4",
    });

    const journalEntry = response.choices[0]?.message?.content || "";
    res.json({ journalEntry });
  } catch (error) {
    console.error("Error compiling journal:", error);
    res.status(500).json({ error: "Failed to compile journal." });
  }
};

module.exports = {
  getGreetings,
  sendMessage,
  compileJournal,
};
