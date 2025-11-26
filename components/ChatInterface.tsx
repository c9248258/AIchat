import React, { useRef, useEffect, useState } from 'react';
import { Message, Sender, UserSettings } from '../types';
import { 
    IconMic, 
    IconSettings, 
    IconVolume, 
    IconTrans, 
    IconEye, 
    IconEyeOff, 
    IconStar, 
    IconBulb, 
    IconRefresh,
    IconMore,
    IconArrowRight
} from './Icons';
import { generateAIResponse, getHint, getTranslation, getNewTopicStart } from '../services/geminiService';

interface ChatInterfaceProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    onOpenSettings: () => void;
    onMessageClick: (msg: Message) => void;
    settings?: UserSettings;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, setMessages, onOpenSettings, onMessageClick, settings }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState("");
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [hint, setHint] = useState<{text: string, translation: string} | null>(null);
    const [isTranslating, setIsTranslating] = useState<string | null>(null);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isBlindMode, setIsBlindMode] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, hint]);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // --- Advanced Audio Logic ---
    const getBestVoice = (lang: 'en-US' | 'en-GB', genderPreference: 'male' | 'female' = 'female') => {
        if (availableVoices.length === 0) return null;

        // Filter by Language
        const langVoices = availableVoices.filter(v => v.lang === lang || v.lang.replace('_', '-') === lang);
        const candidates = langVoices.length > 0 ? langVoices : availableVoices.filter(v => v.lang.startsWith(lang.split('-')[0]));
        
        if (candidates.length === 0) return availableVoices[0];

        // Filter by Gender
        const maleRegex = /male|david|daniel|mark|george|james|uk english male/i;
        const femaleRegex = /female|samantha|zira|victoria|susan|google us english|uk english female/i;

        const genderMatch = candidates.find(v => {
            const name = v.name.toLowerCase();
            return genderPreference === 'male' ? maleRegex.test(name) : femaleRegex.test(name);
        });

        // Prefer Google Voices
        const googleVoice = candidates.find(v => v.name.includes('Google'));

        return genderMatch || googleVoice || candidates[0];
    };

    const playMessageAudio = (id: string, text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Determine Settings based on Accent and Voice ID
            let lang: 'en-US' | 'en-GB' = settings?.accent === 'UK' ? 'en-GB' : 'en-US';
            let pitch = 1;
            let rate = settings?.speed || 1;
            let gender: 'male' | 'female' = 'female';

            // Simulate "Timbre" using Pitch/Rate adjustments
            switch (settings?.voiceId) {
                case 'zhilin': // Sweet Female
                    pitch = 1.4; gender = 'female'; break;
                case 'gentle': // Soft Female
                    pitch = 1.1; rate *= 0.95; gender = 'female'; break;
                case 'taiwan': // Cute Female
                    pitch = 1.6; rate *= 1.05; gender = 'female'; break;
                case 'sister': // Mature Female
                    pitch = 0.9; gender = 'female'; break;
                case 'shota': // Young Male
                    pitch = 1.4; gender = 'male'; break;
                case 'handsome': // Standard Male
                    pitch = 1.0; gender = 'male'; break;
                case 'magnetic': // Deep Male
                    pitch = 0.6; gender = 'male'; break;
                default: // Standard
                    pitch = 1.0; gender = 'female'; break;
            }

            utterance.lang = lang;
            const bestVoice = getBestVoice(lang, gender);
            if (bestVoice) utterance.voice = bestVoice;
            
            utterance.pitch = pitch;
            utterance.rate = rate;

            utterance.onstart = () => setPlayingId(id);
            utterance.onend = () => setPlayingId(null);
            utterance.onerror = () => setPlayingId(null);

            window.speechSynthesis.speak(utterance);
        }
    };

    const handlePlayClick = (id: string, text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (playingId === id) {
            window.speechSynthesis.cancel();
            setPlayingId(null);
        } else {
            playMessageAudio(id, text);
        }
    };

    const handleMute = () => {
        window.speechSynthesis.cancel();
        setPlayingId(null);
    };

    // --- Actions ---

    const handleSend = async (text: string) => {
        setHint(null);
        const newMessage: Message = {
            id: Date.now().toString(),
            sender: Sender.USER,
            text: text,
            scores: { pronunciation: Math.floor(Math.random() * 20) + 80, grammar: Math.floor(Math.random() * 20) + 80 },
            feedback: { pronunciation: "Pronunciation is clear and natural.", grammar: "Good sentence structure and vocabulary." }
        };
        
        const newHistory = [...messages, newMessage];
        setMessages(newHistory);

        const aiText = await generateAIResponse(newHistory.map(m => m.text), text);
        const aiMsgId = (Date.now() + 1).toString();
        
        setMessages(prev => [...prev, {
             id: aiMsgId,
             sender: Sender.AI,
             text: aiText,
             isBlurred: isBlindMode, // Check Blind Mode
             showTranslation: false
        }]);

        // Auto Play
        playMessageAudio(aiMsgId, aiText);
    };

    const handleHint = async () => {
        if (hint) {
            setHint(null);
            return;
        }

        const lastAiMsg = messages.filter(m => m.sender === Sender.AI).pop();
        if (!lastAiMsg) return;

        const difficulty = settings?.difficulty || 'Intermediate';
        const result = await getHint(lastAiMsg.text, difficulty);
        setHint(result);
    };

    const handleChangeTopic = async () => {
        setHint(null);
        handleMute();
        const difficulty = settings?.difficulty || 'Intermediate';
        const topicText = await getNewTopicStart(difficulty);
        
        const newMsgId = Date.now().toString();
        setMessages(prev => [...prev, {
            id: newMsgId,
            sender: Sender.AI,
            text: topicText,
            isBlurred: isBlindMode,
            showTranslation: false
        }]);

        // Auto Play
        playMessageAudio(newMsgId, topicText);
    };

    const toggleTranslation = async (id: string, text: string) => {
        const msg = messages.find(m => m.id === id);
        if (msg && !msg.translation && !isTranslating) {
             setIsTranslating(id);
             const translation = await getTranslation(text);
             setMessages(prev => prev.map(m => 
                 m.id === id ? { ...m, translation, showTranslation: true } : m
             ));
             setIsTranslating(null);
        } else {
             setMessages(prev => prev.map(m => 
                 m.id === id ? { ...m, showTranslation: !m.showTranslation } : m
             ));
        }
    };

    const toggleBlur = (id: string) => {
        setMessages(prev => prev.map(msg => 
            msg.id === id ? { ...msg, isBlurred: !msg.isBlurred } : msg
        ));
    };

    const toggleFavorite = (id: string) => {
        setMessages(prev => prev.map(msg => 
            msg.id === id ? { ...msg, isFavorited: !msg.isFavorited } : msg
        ));
    };

    const toggleBlindMode = () => {
        const newMode = !isBlindMode;
        setIsBlindMode(newMode);
        // Apply global state to AI messages
        setMessages(prev => prev.map(msg => 
            msg.sender === Sender.AI ? { ...msg, isBlurred: newMode } : msg
        ));
    };

    return (
        <div className="flex flex-col h-full bg-[#F7F8FA] relative">
            <style>{`
                @keyframes wave {
                    0%, 100% { height: 30%; }
                    50% { height: 100%; }
                }
                .animate-wave {
                    animation: wave 1s ease-in-out infinite;
                }
            `}</style>

            {/* Header */}
            <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0">
                <div className="font-bold text-gray-800">结束</div>
                <h1 className="text-lg font-bold text-gray-900">语伴口语</h1>
                <div className="flex gap-3 items-center">
                    <IconMore className="w-6 h-6 text-gray-800" />
                    <div className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-800 border-2">
                         <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
                <div className="text-center text-xs text-gray-400 mb-4">对话内容由AI生成</div>
                
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex w-full mb-6 ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === Sender.AI && (
                            <div className="w-10 h-10 rounded-full bg-yellow-100 overflow-hidden mr-3 border border-gray-100 shadow-sm flex-shrink-0">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="AI" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className={`flex flex-col max-w-[85%] ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                            {/* Bubble */}
                            <div 
                                onClick={() => msg.sender === Sender.USER && onMessageClick(msg)}
                                className={`relative p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed cursor-pointer transition-transform active:scale-[0.98]
                                    ${msg.sender === Sender.USER ? 'bg-white rounded-tr-none' : 'bg-white rounded-tl-none'}
                                    ${msg.isBlurred ? 'filter blur-[4px] select-none' : ''}
                                `}
                            >
                                {/* Audio Button */}
                                <button 
                                    onClick={(e) => handlePlayClick(msg.id, msg.text, e)}
                                    className="absolute top-4 right-4 p-2 -mr-3 -mt-3 rounded-full hover:bg-gray-100 transition-colors z-10 group flex items-center justify-center w-10 h-10"
                                >
                                    <div className="flex items-center gap-[2px] h-4">
                                        <div className={`w-[3px] rounded-full transition-all duration-300 ${msg.sender === Sender.AI ? 'bg-orange-500' : 'bg-blue-500'} ${playingId === msg.id ? 'animate-wave' : 'h-2'}`} style={{ animationDelay: '0s' }}></div>
                                        <div className={`w-[3px] rounded-full transition-all duration-300 ${msg.sender === Sender.AI ? 'bg-orange-500' : 'bg-blue-500'} ${playingId === msg.id ? 'animate-wave' : 'h-3'}`} style={{ animationDelay: '0.2s' }}></div>
                                        <div className={`w-[3px] rounded-full transition-all duration-300 ${msg.sender === Sender.AI ? 'bg-orange-500' : 'bg-blue-500'} ${playingId === msg.id ? 'animate-wave' : 'h-4'}`} style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </button>
                                
                                <p className="text-gray-900 font-medium pr-8">{msg.text}</p>
                            </div>

                            {/* User Score Area - Clickable */}
                            {msg.sender === Sender.USER && msg.scores && (
                                <div 
                                    onClick={() => onMessageClick(msg)}
                                    className="flex gap-3 mt-1 mr-1 cursor-pointer active:opacity-60 transition-opacity"
                                >
                                    <div className="text-xs text-gray-500">发音 <span className="text-red-500 font-bold text-sm">{msg.scores.pronunciation}</span></div>
                                    <div className="text-xs text-gray-500">语法 <span className="text-green-500 font-bold text-sm">{msg.scores.grammar}</span></div>
                                    <IconArrowRight className="w-3 h-3 text-gray-400 mt-0.5" />
                                </div>
                            )}

                            {/* AI Toolbar */}
                            {msg.sender === Sender.AI && (
                                <div className="flex flex-col mt-2 ml-1">
                                    <div className="flex gap-4 text-gray-400 items-center">
                                        <button 
                                            onClick={() => toggleTranslation(msg.id, msg.text)}
                                            className={`transition-colors ${msg.showTranslation ? 'text-orange-500' : 'hover:text-orange-400'}`}
                                        >
                                            <IconTrans className={`w-4 h-4 ${isTranslating === msg.id ? 'animate-pulse' : ''}`} />
                                        </button>
                                        <button onClick={() => toggleBlur(msg.id)} className={`transition-colors ${msg.isBlurred ? 'text-orange-500' : 'hover:text-orange-400'}`}>
                                            {msg.isBlurred ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => toggleFavorite(msg.id)} className={`transition-colors ${msg.isFavorited ? 'text-yellow-400' : 'hover:text-yellow-400'}`}>
                                            <IconStar className={`w-4 h-4 ${msg.isFavorited ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                    
                                    {msg.showTranslation && !msg.isBlurred && (
                                        <div className="w-full text-sm text-gray-500 mt-2 pl-2 border-l-2 border-orange-200 animate-fade-in">
                                            {msg.translation || (isTranslating === msg.id ? "正在翻译..." : "")}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {msg.sender === Sender.USER && (
                            <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden ml-3 border border-gray-100 shadow-sm flex-shrink-0">
                                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sorell" alt="User" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                ))}

                 {/* Hint Box */}
                {hint && (
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border-l-4 border-orange-400 animate-fade-in relative">
                        <div className="flex justify-between items-start">
                             <p className="text-sm font-bold text-gray-800 mb-1">对话提示</p>
                             <button 
                                onClick={(e) => handlePlayClick('hint', hint.text, e)}
                                className="text-gray-400 hover:text-orange-500 transition-colors"
                             >
                                <IconVolume className={`w-4 h-4 ${playingId === 'hint' ? 'text-orange-500 animate-pulse' : ''}`} />
                             </button>
                        </div>
                        <p className="text-sm text-gray-800 font-medium mb-1 pr-6">{hint.text}</p>
                        <p className="text-xs text-gray-400">{hint.translation}</p>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="bg-white p-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <div className="flex justify-between mb-6 px-1 relative z-30 gap-2">
                    <button onClick={handleHint} className="flex-1 flex items-center justify-center gap-1 bg-white border shadow-sm px-2 py-2 rounded-lg text-xs font-bold text-gray-700 active:scale-95 active:bg-gray-100 transition-all duration-200">
                        <IconBulb className="w-3.5 h-3.5" /> 提示
                    </button>
                    <button onClick={handleChangeTopic} className="flex-1 flex items-center justify-center gap-1 bg-white border shadow-sm px-2 py-2 rounded-lg text-xs font-bold text-gray-700 active:scale-95 active:bg-gray-100 transition-all duration-200">
                        <IconRefresh className="w-3.5 h-3.5" /> 换话题
                    </button>
                    <button onClick={handleMute} className="flex-1 flex items-center justify-center gap-1 bg-white border shadow-sm px-2 py-2 rounded-lg text-xs font-bold text-gray-700 active:scale-95 active:bg-gray-100 transition-all duration-200">
                        <IconVolume className="w-3.5 h-3.5" /> 静音
                    </button>
                    <button 
                        onClick={toggleBlindMode}
                        className={`flex-1 flex items-center justify-center gap-1 border shadow-sm px-2 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all duration-200 ${isBlindMode ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-700 active:bg-gray-100'}`}
                    >
                        {isBlindMode ? <IconEyeOff className="w-3.5 h-3.5" /> : <IconEye className="w-3.5 h-3.5" />} 隐藏
                    </button>
                    <button onClick={onOpenSettings} className="flex-1 flex items-center justify-center gap-1 bg-white border shadow-sm px-2 py-2 rounded-lg text-xs font-bold text-gray-700 active:scale-95 active:bg-gray-100 transition-all duration-200">
                        <IconSettings className="w-3.5 h-3.5" /> 设置
                    </button>
                </div>

                {/* Input Area */}
                <div className="relative">
                    <div className="absolute -top-12 left-0 w-full flex justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none hover:pointer-events-auto z-10">
                         <input 
                            type="text" 
                            className="border p-1 rounded text-xs w-64 shadow" 
                            placeholder="Debug: Type to send..." 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') {
                                    handleSend(inputText);
                                    setInputText('');
                                }
                            }}
                         />
                    </div>

                    <button 
                        className={`w-full h-14 rounded-full flex items-center justify-center gap-2 font-bold text-gray-800 shadow-sm border border-gray-100 transition-all active:scale-95 ${isRecording ? 'bg-gray-100 scale-95' : 'bg-white active:bg-gray-50'}`}
                        onMouseDown={() => setIsRecording(true)}
                        onMouseUp={() => { setIsRecording(false); if(inputText) { handleSend(inputText); setInputText(''); } else { handleSend("This is a simulated voice message."); } }}
                        onTouchStart={() => setIsRecording(true)}
                        onTouchEnd={() => { setIsRecording(false); handleSend("This is a simulated voice message."); }}
                    >
                        <div className="w-5 h-5 rounded-full border border-gray-800 flex items-center justify-center">
                            <IconMic className="w-3 h-3 text-gray-800" />
                        </div>
                        {isRecording ? "松开 发送" : "按住 说话"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;