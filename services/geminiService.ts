import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateAIResponse = async (history: string[], userMessage: string): Promise<string> => {
  if (!ai) {
    // Fallback if no API key
    return "I am a simulated response because no API Key was provided. Please check your configuration.";
  }

  try {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: `You are a helpful English language partner. Keep responses conversational and concise. Previous conversation: ${JSON.stringify(history)}. User says: ${userMessage}` }] }
      ]
    });
    return response.text || "Sorry, I couldn't think of a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error connecting to the AI.";
  }
};

export const getTranslation = async (text: string): Promise<string> => {
  if (!ai) return "模拟翻译结果"; // Simplified fallback

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the following English text to natural, colloquial Chinese. Return ONLY the Chinese translation text. Do not include any explanations, labels, or extra words. Text: "${text}"`
    });
    return response.text?.trim() || "翻译失败";
  } catch (e) {
    console.error(e);
    return "翻译不可用";
  }
};

export const getHint = async (context: string, difficulty: string = 'Intermediate'): Promise<{ text: string; translation: string }> => {
  if (!ai) return { text: "That sounds interesting! Tell me more.", translation: "听起来很有趣！再多和我说说。" };
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an English tutor helping a student at ${difficulty} level. 
      Based on the context: "${context}", suggest a natural response for the student to say next.
      The suggestion should be a mix of a short reaction and a longer follow-up sentence (e.g., "Really? I didn't know that. It reminds me of...").
      Return ONLY the English response and its Chinese translation separated by a pipe character (|). 
      Example: Wow, that's cool! I've never been there before.|哇，太酷了！我以前从没去过那里。`
    });
    const raw = response.text || "";
    const parts = raw.split('|');
    if (parts.length >= 2) {
        return { text: parts[0].trim(), translation: parts[1].trim() };
    }
    return { text: raw, translation: "暂无翻译" };
  } catch (e) {
    return { text: "Could you explain that in more detail?", translation: "你能更详细地解释一下吗？" };
  }
};

export const getNewTopicStart = async (difficulty: string = 'Intermediate'): Promise<string> => {
    if (!ai) return "Let's talk about travel. Where is the best place you have ever been?";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Pick a random, engaging topic (e.g., movies, food, travel, hobbies) suitable for an English learner at ${difficulty} level.
            Write a conversational opening sentence to start this new topic and ask a question to invite the user to speak.
            Keep it under 30 words.`
        });
        return response.text || "Let's talk about food. What's your favorite dish?";
    } catch (e) {
        return "Let's talk about movies. Have you seen any good ones lately?";
    }
};