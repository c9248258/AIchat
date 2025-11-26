import React from 'react';
import { UserSettings } from '../types';
import { IconBack, IconMore, IconArrowRight } from './Icons';

interface SettingsSheetProps {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  onClose: () => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({ settings, updateSettings, onClose }) => {
  
  // 固定显示的语音库（美式库）
  const usVoices = [
    { id: 'zhilin', name: '志林姐姐' },
    { id: 'gentle', name: '温柔甜妹' },
    { id: 'taiwan', name: '可爱台妹' },
    { id: 'sister', name: '知心姐姐' },
    { id: 'shota', name: '可爱正太' },
    { id: 'handsome', name: '年轻帅哥' },
    { id: 'magnetic', name: '磁性嗓音' },
    { id: 'us_standard', name: '美式标准' },
  ];

  const levels = ['学前', '小学', '初中', '高中', '四级', '六级', '考研', '商务', '专四专八', '雅思', '托福', 'GRE', 'GMAT', 'SAT', '高难度'];

  const handleAccentChange = (accent: 'US' | 'UK') => {
      updateSettings({ accent });
  };

  return (
    <div className="absolute inset-0 bg-[#F7F8FA] z-40 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button onClick={onClose} className="p-2 -ml-2">
          <IconBack className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">口语设置</h1>
        <div className="flex gap-2">
            <button className="p-2"><IconMore className="w-6 h-6 text-gray-800" /></button>
            <div className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-800 border-2">
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Accent Selection */}
        <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4">对话发音</h3>
            <div className="flex gap-4">
                <button 
                    onClick={() => handleAccentChange('US')}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-between ${settings.accent === 'US' ? 'border-lime-400 bg-lime-50 text-lime-800' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                >
                    <span className="font-bold">美式发音 (US)</span>
                    {settings.accent === 'US' && <div className="w-3 h-3 rounded-full bg-lime-500"></div>}
                </button>
                <button 
                    onClick={() => handleAccentChange('UK')}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-between ${settings.accent === 'UK' ? 'border-lime-400 bg-lime-50 text-lime-800' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                >
                    <span className="font-bold">英式发音 (UK)</span>
                    {settings.accent === 'UK' && <div className="w-3 h-3 rounded-full bg-lime-500"></div>}
                </button>
            </div>
        </div>

        {/* Voice Timbre - Always show US Voices list */}
        <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4">发音音色</h3>
            
            <div className="grid grid-cols-4 gap-3 mb-1">
                {usVoices.map(voice => (
                    <button 
                        key={voice.id}
                        onClick={() => updateSettings({ voiceId: voice.id })}
                        className={`py-2 px-1 text-xs rounded-xl border truncate transition-all ${voice.id === settings.voiceId ? 'bg-lime-100 border-lime-400 text-lime-700 font-bold' : 'bg-white border-gray-100 text-gray-500'}`}
                    >
                        {voice.name}
                    </button>
                ))}
            </div>
            <div className="flex justify-center text-gray-400 text-xs items-center gap-1 cursor-pointer hover:text-gray-600 mt-3">
                查看更多 <IconArrowRight className="w-3 h-3 rotate-90" />
            </div>
        </div>

        {/* Vocabulary Level */}
        <div className="bg-white rounded-2xl p-4">
             <h3 className="font-bold text-lg text-gray-900 mb-4">词汇难度</h3>
             <div className="flex flex-wrap gap-3">
                {levels.map(level => (
                    <button
                        key={level}
                        onClick={() => updateSettings({ difficulty: level })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${settings.difficulty === level ? 'bg-lime-300 text-gray-900' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        {level}
                    </button>
                ))}
             </div>
        </div>

        {/* Other Settings */}
        <div className="bg-white rounded-2xl overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-gray-50">
                <span className="text-gray-900 font-bold">朗读语速</span>
                <div className="flex items-center text-gray-600">
                    {settings.speed}倍速 <IconArrowRight className="w-4 h-4 ml-1" />
                </div>
            </div>
            <div className="p-4 flex justify-between items-center border-b border-gray-50">
                <span className="text-gray-900 font-bold flex items-center gap-1">
                    自动评分 <span className="text-gray-300 text-xs font-normal">开启后将进行实时评分</span>
                </span>
                <button 
                    onClick={() => updateSettings({ autoScore: !settings.autoScore })}
                    className={`w-12 h-7 rounded-full relative transition-colors ${settings.autoScore ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.autoScore ? 'left-6' : 'left-1'}`}></div>
                </button>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-gray-900 font-bold">字号设置</span>
                <div className="flex items-center text-gray-600">
                    标准 <IconArrowRight className="w-4 h-4 ml-1" />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsSheet;