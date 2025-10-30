import { useState, useEffect, useRef } from 'react';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasSupport: boolean;
  error: string | null;
  isProcessing: boolean;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const hasSupport = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  useEffect(() => {
    if (!hasSupport) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    recognition.current = rec;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {  
        const finalTranscript = result[0].transcript;
        setTranscript(finalTranscript);
        stopListening(); 
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const processVoiceWithBackend = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/voice/process', {
        method: 'POST',
        headers: {
        
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          userName: 'User', // This should be dynamic
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing voice:', error);
      setError('Failed to process voice input');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    setError(null);
    setTranscript('');
    setIsListening(true);
    recognition.current?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognition.current?.stop();
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasSupport,
    error,
    isProcessing
  };
};
