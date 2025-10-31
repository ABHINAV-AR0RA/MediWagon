import React, { useState } from 'react';
import { X, Mic, Send } from 'lucide-react';
import { MediWagonAvatar } from './mediwagon-avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface FloatingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m Asha, your AI health companion. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I understand. Let me help you with that. Could you provide more details?',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl overflow-hidden border border-border">
        <div className="bg-gradient-to-r from-primary to-cyan-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MediWagonAvatar size="md" isListening={isListening} showWaveform={isListening} />
            <div className="text-white">
              <h3>Asha</h3>
              <p className="opacity-90">Always here to help</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-2xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-96 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-background/50">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message or use voice..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-2xl bg-input-background border-border"
            />
            <Button
              size="icon"
              variant={isListening ? 'default' : 'outline'}
              onClick={toggleListening}
              className="rounded-2xl"
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={handleSend}
              className="rounded-2xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
