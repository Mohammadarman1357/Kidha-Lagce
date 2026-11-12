/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Globe, Sparkles, Volume2, AlertCircle } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptResult: (text: string) => void;
  initialLang?: 'bn-BD' | 'en-US';
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onTranscriptResult,
  initialLang = 'bn-BD',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<'bn-BD' | 'en-US'>(initialLang);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage(
        'Web Speech API is not supported in this browser. Try Google Chrome, Edge, or an Android Webview.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        setTranscript(text);

        if (finalTranscript) {
          // Success! Provide haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate([40, 60, 40]);
          }
          setTimeout(() => {
            onTranscriptResult(finalTranscript.trim());
            onClose();
          }, 600);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setErrorMessage("No speech detected. Tap 'Try Again' and speak clearly.");
        } else {
          setErrorMessage(`Voice search error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Failed to initialize SpeechRecognition:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [language, onTranscriptResult, onClose]);

  // Start listening whenever modal opens
  useEffect(() => {
    if (isOpen && isSupported && recognitionRef.current) {
      setTranscript('');
      setErrorMessage(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition might already be running
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isOpen, isSupported]);

  if (!isOpen) return null;

  const toggleLanguage = () => {
    const nextLang = language === 'bn-BD' ? 'en-US' : 'bn-BD';
    setLanguage(nextLang);
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
  };

  const handleStartAgain = () => {
    setTranscript('');
    setErrorMessage(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const handleQuickSuggestion = (text: string) => {
    onTranscriptResult(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#161720] border border-[#2c2f42] rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#222432] text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Language Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-neutral-400">Language:</span>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202230] border border-[#2f3246] hover:border-[#FF6B35] text-xs font-bold text-white transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{language === 'bn-BD' ? 'বাংলা (Bangla)' : 'English (US)'}</span>
          </button>
        </div>

        {/* Animated Microphone Radar / Waves */}
        <div className="relative my-4 flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-[#FF6B35]/20 animate-ping duration-1000" />
              <div className="absolute w-28 h-28 rounded-full bg-[#FF6B35]/30 animate-pulse duration-700" />
            </>
          )}

          <button
            onClick={isListening ? () => recognitionRef.current?.abort() : handleStartAgain}
            className={`w-20 h-20 rounded-full flex items-center justify-center relative z-10 shadow-2xl transition-all cursor-pointer ${
              isListening
                ? 'bg-gradient-to-tr from-[#FF6B35] to-[#f4511e] text-white shadow-orange-950/80 scale-105'
                : 'bg-[#222432] text-neutral-400 border border-[#2f3246] hover:text-white'
            }`}
          >
            {isListening ? (
              <Mic className="w-9 h-9 animate-bounce duration-700" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Status Text & Transcript */}
        <div>
          <h3 className="text-base font-black text-white">
            {isListening ? (
              language === 'bn-BD' ? (
                'বলুন, আপনি কি খেতে চান?'
              ) : (
                'Listening for food or restaurant...'
              )
            ) : errorMessage ? (
              'Voice Search Stopped'
            ) : (
              'Tap microphone to speak'
            )}
          </h3>

          <p className="text-xs text-neutral-400 mt-1">
            {language === 'bn-BD'
              ? 'যেমন: "কাচ্চি বিরিয়ানি", "বার্গার ল্যাব", "পিজা"'
              : 'Try: "Mutton Kacchi", "Burger Lab", "Pepperoni Pizza"'}
          </p>

          {/* Live Recognized Transcript Display */}
          <div className="min-h-12 mt-3 p-3 rounded-2xl bg-[#111219] border border-[#252838] flex items-center justify-center">
            {transcript ? (
              <span className="text-sm font-extrabold text-[#FF6B35] animate-in fade-in">
                "{transcript}"
              </span>
            ) : isListening ? (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-ping" />
                <span>Listening...</span>
              </div>
            ) : (
              <span className="text-xs text-neutral-500 italic">No audio input yet</span>
            )}
          </div>
        </div>

        {/* Error message if microphone denied or not supported */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Voice Suggestion Chips */}
        <div className="w-full pt-2 border-t border-[#252838]">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Popular Voice Searches
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {[
              { label: 'কাচ্চি বিরিয়ানি', query: 'Kacchi' },
              { label: 'Double Beef Burger', query: 'Burger' },
              { label: 'Artisan Pizza', query: 'Pizza' },
              { label: 'Star Kabab', query: 'Star Kabab' },
              { label: 'Mutton Seekh', query: 'Seekh' },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => handleQuickSuggestion(s.query)}
                className="px-2.5 py-1 rounded-xl bg-[#202230] hover:bg-[#282b3d] text-[11px] font-bold text-neutral-300 hover:text-white border border-[#2a2d40] transition-colors"
              >
                🎙️ {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
