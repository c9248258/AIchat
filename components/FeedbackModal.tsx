import React, { useState } from 'react';
import { Message } from '../types';
import { IconClose, IconVolume, IconChevronDown, IconChevronUp } from './Icons';

interface FeedbackModalProps {
  message: Message;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ message, onClose }) => {
  const [expandedSection, setExpandedSection] = useState<'pronunciation' | 'grammar' | null>('pronunciation');

  if (!message.scores || !message.feedback) return null;

  const playAudio = (text: string, lang: string = 'en-US') => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang;
          window.speechSynthesis.speak(utterance);
      }
  };

  const toggleSection = (section: 'pronunciation' | 'grammar') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#F5F6F8] rounded-t-3xl sm:rounded-3xl h-[85vh] sm:h-[600px] overflow-hidden flex flex-col shadow-2xl animate-slide-up">
        
        {/* Header - Original Text */}
        <div className="bg-white p-6 rounded-b-3xl shadow-sm z-10 relative flex-shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
                <IconClose className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">原句</span>
            </div>
            <p className="text-gray-800 font-bold text-lg leading-relaxed">
                {message.text}
            </p>

            {/* Audio Controls */}
            <div className="flex gap-3 mt-6">
                <button 
                    onClick={() => playAudio(message.text, 'en-US')}
                    className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-2 rounded-full text-sm font-medium text-gray-700 active:bg-gray-50 hover:bg-gray-50 transition-colors"
                >
                    美式发音 <IconVolume className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => playAudio(message.text, 'en-GB')}
                    className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-2 rounded-full text-sm font-medium text-gray-700 active:bg-gray-50 hover:bg-gray-50 transition-colors"
                >
                    英式发音 <IconVolume className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-2 rounded-full text-sm font-medium text-gray-700 active:bg-gray-50">
                    我的原音 <IconVolume className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            <div className="flex items-center gap-2 mb-2">
                 <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">评分</span>
            </div>

            {/* Pronunciation Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                <button 
                    onClick={() => toggleSection('pronunciation')}
                    className="w-full p-5 flex items-center justify-between bg-white"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm font-medium">发音</span>
                        <span className="text-red-500 text-xl font-bold">{message.scores.pronunciation}</span>
                    </div>
                    {expandedSection === 'pronunciation' ? <IconChevronUp className="w-5 h-5 text-gray-400" /> : <IconChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                
                {expandedSection === 'pronunciation' && (
                    <div className="px-5 pb-5 animate-fade-in">
                         <div className="w-full h-px bg-gray-100 mb-3"></div>
                        <p className="text-gray-600 text-sm leading-relaxed text-justify">
                            {message.feedback.pronunciation}
                        </p>
                    </div>
                )}
            </div>

            {/* Grammar Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 mb-10">
                 <button 
                    onClick={() => toggleSection('grammar')}
                    className="w-full p-5 flex items-center justify-between bg-white"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm font-medium">语法</span>
                        <span className="text-green-500 text-xl font-bold">{message.scores.grammar}</span>
                    </div>
                    {expandedSection === 'grammar' ? <IconChevronUp className="w-5 h-5 text-gray-400" /> : <IconChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                
                {expandedSection === 'grammar' && (
                    <div className="px-5 pb-5 animate-fade-in">
                        <div className="w-full h-px bg-gray-100 mb-3"></div>
                        <p className="text-gray-600 text-sm leading-relaxed text-justify">
                            {message.feedback.grammar}
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;