import React, { useState } from 'react';
import { Theme } from '../types';
import { Sparkles, Send, Loader2, X } from 'lucide-react';
import { generateThemeFromMood } from '../services/geminiService';

interface ControlsProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const Controls: React.FC<ControlsProps> = ({ currentTheme, onThemeChange }) => {
  const [moodInput, setMoodInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moodInput.trim()) return;

    setIsLoading(true);
    const newTheme = await generateThemeFromMood(moodInput);
    onThemeChange(newTheme);
    setIsLoading(false);
    setMoodInput('');
    setIsOpen(false); 
  };

  // If closed, show a minimal floating button in the bottom right
  if (!isOpen) {
    return (
      <div className="absolute bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-5 py-3 rounded-full transition-all shadow-lg hover:shadow-cyan-500/20"
        >
          <Sparkles size={18} className="text-cyan-300 group-hover:rotate-12 transition-transform" />
          <span className="font-light tracking-wide">Customize Vibe</span>
        </button>
      </div>
    );
  }

  // Modal View
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-500">
      
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8 mt-2">
           <h2 className="text-3xl font-thin text-white mb-2">Change the Atmosphere</h2>
           <p className="text-white/50 text-sm">Describe how you feel, or how you want to feel.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <input 
              type="text"
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              placeholder="e.g. Floating in warm water, Cyberpunk rain..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-lg"
              disabled={isLoading}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={isLoading || !moodInput}
              className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
             <PresetButton emoji="🌊" label="Ocean Deep" onClick={() => setMoodInput('Deep ocean silence')} />
             <PresetButton emoji="🔥" label="Cozy Fire" onClick={() => setMoodInput('Warm crackling fireplace')} />
             <PresetButton emoji="🍃" label="Forest Rain" onClick={() => setMoodInput('Rain in a lush forest')} />
             <PresetButton emoji="🌌" label="Nebula" onClick={() => setMoodInput('Colorful cosmic dust')} />
             <PresetButton emoji="🍬" label="Cotton Candy" onClick={() => setMoodInput('Pastel sweet dreamy')} />
             <PresetButton emoji="⚡" label="Neon City" onClick={() => setMoodInput('Cyberpunk night city')} />
          </div>
        </form>
      </div>
    </div>
  );
};

const PresetButton = ({ emoji, label, onClick }: { emoji: string, label: string, onClick: () => void }) => (
    <button 
        type="button"
        onClick={onClick}
        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-sm text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 group"
    >
        <span className="text-lg group-hover:scale-110 transition-transform">{emoji}</span>
        <span>{label}</span>
    </button>
);

export default Controls;