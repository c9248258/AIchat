import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateAIResponse = async (history: string[], userMessage: string): Promise<string> => {
  if (!ai) {
    // 模拟数据：根据用户输入稍微变化回答
    const responses = [
        "That's a really interesting perspective! Tell me more about it.",
        "I never thought about it that way. Have you always felt like that?",
        "Sounds great! By the way, how often do you practice English?",
        "I see. That reminds me of a movie I watched recently."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  try {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: `You are a helpful English language partner. Keep responses conversational, natural and concise (around 20-40 words). Previous conversation: ${JSON.stringify(history)}. User says: ${userMessage}` }] }
      ]
    });
    return response.text || "Sorry, I couldn't think of a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error connecting to the AI.";
  }
};

export const getTranslation = async (text: string): Promise<string> => {
  if (!ai) return "这是模拟的中文翻译内容，用于演示界面布局。";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the following English text to natural, colloquial Chinese. Return ONLY the Chinese translation text. Do not include any explanations, labels, or extra words. Text: "${text}"`
    });
    return response.text?.trim() || "翻译失败";
  } catch (e) {
    console.error(e);
    return "翻译服务暂时不可用";
  }
};

export const getHint = async (context: string, difficulty: string = 'Intermediate'): Promise<{ text: string; translation: string }> => {
  if (!ai) return { text: "That sounds fascinating! I'd love to hear more details about it.", translation: "听起来很迷人！我很想听听更多细节。" };
  
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
    if (!ai) {
        const topics = [
            "Let's talk about food. What is the most delicious meal you've ever had?",
            "How about movies? Have you seen any good films lately?",
            "Let's switch to travel. If you could go anywhere right now, where would you go?"
        ];
        return topics[Math.floor(Math.random() * topics.length)];
    }
    
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