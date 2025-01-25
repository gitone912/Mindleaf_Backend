require("dotenv").config();
const OpenAI = require("openai");
const { getPrompt } = require("./system"); // Assuming system.js is in the same directory
const { PromptModel, GratitudeModel } = require("../models/GPTModel");

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

// 4. Return Prompt
const returnPrompt = async (req, res) => {
  const { language, userId } = req.body;

  if (!language || !userId) {
    return res.status(400).json({ error: "Language and userId are required." });
  }

  try {
    const usedPromptsArray = await PromptModel.getUserPrompts(userId);

    const promptGenerationRequest = `Generate a thoughtful journal prompt in ${language}. The prompt should be introspective and help users reflect on their day or life experiences. 
    DO NOT use any of these previously used prompts: ${JSON.stringify(usedPromptsArray)}.
    Return only the prompt question, nothing else.`;

    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: promptGenerationRequest }],
      model: "gpt-4",
    });

    const newPrompt = response.choices[0]?.message?.content;
    await PromptModel.saveUserPrompt(userId, newPrompt);

    res.json({ prompt: newPrompt });
  } catch (error) {
    console.error("Error generating prompt:", error);
    res.status(500).json({ error: "Failed to generate prompt." });
  }
};

// 5. Return Gratitude
const returnGratitude = async (req, res) => {
  const { language, userId } = req.body;

  if (!language || !userId) {
    return res.status(400).json({ error: "Language and userId are required." });
  }

  try {
    const usedGratitudeArray = await GratitudeModel.getUserGratitude(userId);

    const gratitudePromptRequest = `Generate a gratitude-focused journal prompt in ${language}. The prompt should help users reflect on positive aspects of their life and express thankfulness. 
    DO NOT use any of these previously used prompts: ${JSON.stringify(usedGratitudeArray)}.
    Return only the gratitude question, nothing else.`;

    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: gratitudePromptRequest }],
      model: "gpt-4",
    });

    const newGratitudePrompt = response.choices[0]?.message?.content;
    await GratitudeModel.saveUserGratitude(userId, newGratitudePrompt);

    res.json({ prompt: newGratitudePrompt });
  } catch (error) {
    console.error("Error generating gratitude prompt:", error);
    res.status(500).json({ error: "Failed to generate gratitude prompt." });
  }
};

// 6. Journal Summary
const journalSummary = async (req, res) => {
  const { language, journalEntry } = req.body;

  if (!language || !journalEntry) {
    return res.status(400).json({ error: "Language and journal entry are required." });
  }

  const summaryPrompt = `Analyze this journal entry and provide a very concise summary in ${language}. The summary must be exactly 4-5 lines only. Focus on the main emotions, key events, and core thoughts. Be direct and clear.`;

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: summaryPrompt },
        { role: "user", content: journalEntry }
      ],
      model: "gpt-4",
    });

    const summary = response.choices[0]?.message?.content || "";
    res.json({ summary });
  } catch (error) {
    console.error("Error creating journal summary:", error);
    res.status(500).json({ error: "Failed to create summary." });
  }
};

// 7. Get Keywords
const getKeywords = async (req, res) => {
  const { language, journalEntry } = req.body;

  if (!language || !journalEntry) {
    return res.status(400).json({ error: "Language and journal entry are required." });
  }

  const keywordPrompt = `Analyze this journal entry and extract exactly 3 keywords in ${language} that best represent the user's personality traits or primary thought patterns. Return only the 3 keywords separated by commas, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: keywordPrompt },
        { role: "user", content: journalEntry }
      ],
      model: "gpt-4",
    });

    const keywords = response.choices[0]?.message?.content || "";
    res.json({ keywords });
  } catch (error) {
    console.error("Error extracting keywords:", error);
    res.status(500).json({ error: "Failed to extract keywords." });
  }
};

// 8. Get Satisfaction Score
const getSatisfactionScore = async (req, res) => {
  const { language, journalEntry } = req.body;

  if (!language || !journalEntry) {
    return res.status(400).json({ error: "Language and journal entry are required." });
  }

  const scorePrompt = `Based on this journal entry, calculate a life satisfaction score from 0 to 100. Analyze the tone, emotions, and content to determine this score. Return only a number, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: scorePrompt },
        { role: "user", content: journalEntry }
      ],
      model: "gpt-4",
    });

    let score = response.choices[0]?.message?.content || "0";
    // Extract only the number using regex
    score = score.match(/\d+/)[0];
    
    res.json({ satisfactionScore: parseInt(score) });
  } catch (error) {
    console.error("Error calculating satisfaction score:", error);
    res.status(500).json({ error: "Failed to calculate satisfaction score." });
  }
};

// 9. Get Recommended Actions
const getRecommendedActions = async (req, res) => {
  const { language, journalEntry } = req.body;

  if (!language || !journalEntry) {
    return res.status(400).json({ error: "Language and journal entry are required." });
  }

  const actionsPrompt = `Based on this journal entry, provide exactly 3 specific, actionable recommendations that could help improve the user's wellbeing. 
  Requirements:
  - MUST respond ONLY in ${language} language
  - Each action should be under 10 words
  - Actions should be practical and directly related to the journal content
  - Return EXACTLY 3 actions in a single line, separated by commas
  - DO NOT include numbers, bullets, or any other formatting`;

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: actionsPrompt },
        { role: "user", content: journalEntry }
      ],
      model: "gpt-4",
    });

    const actions = response.choices[0]?.message?.content || "";
    // Split by comma, trim each action, and filter out empty strings
    const actionsList = actions.split(',')
      .map(action => action.trim())
      .filter(action => action.length > 0)
      .slice(0, 3); // Ensure exactly 3 items

    res.json({ recommendedActions: actionsList.join(', ') });
  } catch (error) {
    console.error("Error generating recommended actions:", error);
    res.status(500).json({ error: "Failed to generate recommended actions." });
  }
};

// 10. Get Journal Title
const getJournalTitle = async (req, res) => {
  const { language, journalEntry } = req.body;

  if (!language || !journalEntry) {
    return res.status(400).json({ error: "Language and journal entry are required." });
  }

  const titlePrompt = `Based on this journal entry, generate a concise 2-3 word title in ${language} that captures the main theme or emotion. Return only the title, nothing else. Do not include quotes.`;

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: titlePrompt },
        { role: "user", content: journalEntry }
      ],
      model: "gpt-4",
    });

    const title = response.choices[0]?.message?.content || "";
    // Clean the string by removing quotes and extra whitespace
    const cleanTitle = title.replace(/['"]+/g, '').trim();
    res.json({ title: cleanTitle });
  } catch (error) {
    console.error("Error generating journal title:", error);
    res.status(500).json({ error: "Failed to generate journal title." });
  }
};

module.exports = {
  getGreetings,
  sendMessage,
  compileJournal,
  returnPrompt,
  returnGratitude,
  journalSummary,
  getKeywords,
  getSatisfactionScore,
  getRecommendedActions,
  getJournalTitle
};

