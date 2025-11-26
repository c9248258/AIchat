import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import SettingsSheet from './components/SettingsSheet';
import FeedbackModal from './components/FeedbackModal';
import { Message, UserSettings, DEMO_MESSAGES } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const [settings, setSettings] = useState<UserSettings>({
    accent: 'US',
    voiceId: 'zhilin',
    difficulty: '学前',
    speed: 1,
    autoScore: true,
    fontSize: 'standard'
  });

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="w-full h-screen flex justify-center bg-gray-100 overflow-hidden">
        {/* Mobile Container */}
        <div className="w-full max-w-md h-full bg-white shadow-2xl relative overflow-hidden flex flex-col">
            
            <ChatInterface 
                messages={messages} 
                setMessages={setMessages}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onMessageClick={setSelectedMessage}
            />

            {/* Overlays */}
            {isSettingsOpen && (
                <SettingsSheet 
                    settings={settings} 
                    updateSettings={handleUpdateSettings} 
                    onClose={() => setIsSettingsOpen(false)} 
                />
            )}

            {selectedMessage && (
                <FeedbackModal 
                    message={selectedMessage} 
                    onClose={() => setSelectedMessage(null)} 
                />
            )}
            
        </div>
    </div>
  );
};

export default App;