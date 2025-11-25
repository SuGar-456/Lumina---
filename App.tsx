import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import Controls from './components/Controls';
import ChallengeHud from './components/ChallengeHud';
import { Theme, DailyChallenge } from './types';
import { getDailyChallenge, saveChallenge } from './services/challengeService';
import { Info, Volume2, VolumeX, Wind } from 'lucide-react';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>({
    name: "Lumina",
    colors: ["#818CF8", "#C084FC", "#E879F9", "#22D3EE", "#34D399"],
    speed: 1.0,
    flowType: 'calm',
    message: "Touch the screen to disturb the flow."
  });

  const [challenge, setChallenge] = useState<DailyChallenge>(() => getDailyChallenge());
  const [showInfo, setShowInfo] = useState(false);
  const [breathingMode, setBreathingMode] = useState(false);

  useEffect(() => {
    saveChallenge(challenge);
  }, [challenge]);

  const handleChallengeProgress = (increment: number) => {
    setChallenge(prev => {
      if (prev.completed) return prev;
      
      const newProgress = Math.min(prev.target, prev.progress + increment);
      const isComplete = newProgress >= prev.target;
      
      return {
        ...prev,
        progress: newProgress,
        completed: isComplete
      };
    });
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans select-none">
      
      {/* Background Canvas */}
      <GameCanvas 
        theme={theme} 
        challenge={challenge} 
        onProgressUpdate={handleChallengeProgress}
        breathingMode={breathingMode}
      />

      {/* Top Left: Challenge HUD */}
      {!breathingMode && <ChallengeHud challenge={challenge} />}
      
      {/* Top Center: Theme Title (Non-intrusive) */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-none text-center z-10 opacity-70">
        <h1 className="text-white text-xl font-thin tracking-[0.2em] uppercase shadow-black drop-shadow-lg">{theme.name}</h1>
        <p className="text-white/50 text-xs mt-1 font-light tracking-wide max-w-md">{theme.message}</p>
      </div>

      {/* Top Right: Utility Buttons */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-3">
        {/* Breathing Mode Toggle */}
        <button 
          onClick={() => setBreathingMode(!breathingMode)}
          className={`p-3 rounded-full backdrop-blur-md transition-all border ${breathingMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-black/20 text-white/40 border-white/5 hover:text-white hover:bg-black/40'}`}
          title="Toggle Breathing Guide"
        >
          <Wind size={20} className={breathingMode ? "animate-pulse" : ""} />
        </button>

        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="bg-black/20 hover:bg-black/40 backdrop-blur-md p-3 rounded-full text-white/40 hover:text-white transition-all border border-white/5"
          title="Controls & Info"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Modal Controls (Bottom Right Trigger) */}
      {!breathingMode && <Controls currentTheme={theme} onThemeChange={setTheme} />}

      {/* Instructions Modal */}
      {showInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-[#111] border border-white/10 p-8 rounded-2xl max-w-sm text-center shadow-2xl relative">
              <button onClick={()=>setShowInfo(false)} className="absolute top-3 right-3 text-white/30 hover:text-white">✕</button>
              <h2 className="text-2xl text-white font-thin mb-4">Interactions</h2>
              <ul className="text-white/60 space-y-4 text-sm mb-6 text-left">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                    <span><strong>Left Click:</strong> Attract particles.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                    <span><strong>Right Click & Drag:</strong> Paint wind currents to direct the flow.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                    <span><strong>Double Click:</strong> Spawn a temporary Gravity Vortex.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0"></span>
                    <span><strong>Scrub Knots:</strong> Rapidly move mouse over dark knots to clear stress.</span>
                  </li>
              </ul>
              <button 
                onClick={() => setShowInfo(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition-colors font-medium text-sm"
              >
                Close
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;