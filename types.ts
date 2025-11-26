export enum Sender {
  AI = 'AI',
  USER = 'USER'
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  translation?: string;
  isBlurred?: boolean;
  showTranslation?: boolean;
  isFavorited?: boolean;
  scores?: {
    pronunciation: number;
    grammar: number;
  };
  feedback?: {
    pronunciation: string;
    grammar: string;
  };
}

export interface UserSettings {
  accent: 'US' | 'UK';
  voiceId: string;
  difficulty: string;
  speed: number;
  autoScore: boolean;
  fontSize: 'standard' | 'large';
}

export const DEMO_MESSAGES: Message[] = [
  {
    id: '1',
    sender: Sender.AI,
    text: "Hey, Luca! How's it going? I was just thinking about how much I love my favorite app. What about you? What's yours?",
    translation: "嘿，卢卡！最近怎么样呀？我刚才正想着自己有多喜欢我最爱的那款应用呢。你呢？你最喜欢的应用是什么呀？",
    showTranslation: true,
  },
  {
    id: '2',
    sender: Sender.USER,
    text: "Hey there! First off, just a tiny note—looks like there are a few small typos in your message",
    scores: {
      pronunciation: 86,
      grammar: 95
    },
    feedback: {
      pronunciation: "发音准确度高，多数单词（如 \"bet\" \"guess\" \"thinking\"）的音标发音标准，词尾辅音清晰；语调自然流畅。",
      grammar: "语法基础扎实，句型结构正确，时态使用统一（全程用一般现在时，符合语境）。"
    }
  },
  {
    id: '3',
    sender: Sender.AI,
    text: "Oh, no worries at all about pointing out the typos—thanks for keeping it friendly!",
    isBlurred: true,
    translation: "噢，完全不用担心指出拼写错误这件事——谢谢你这么友好！"
  }
];