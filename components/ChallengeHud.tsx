import React from 'react';
import { DailyChallenge } from '../types';
import { Trophy, CheckCircle, Target } from 'lucide-react';

interface ChallengeHudProps {
  challenge: DailyChallenge;
}

const ChallengeHud: React.FC<ChallengeHudProps> = ({ challenge }) => {
  const percent = Math.min(100, (challenge.progress / challenge.target) * 100);

  return (
    <div className="absolute top-4 left-4 z-40 pointer-events-auto">
      <div className={`
        relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-500
        ${challenge.completed ? 'bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-black/40'}
        p-4 w-64
      `}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-full ${challenge.completed ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'}`}>
             {challenge.completed ? <Trophy size={18} /> : <Target size={18} />}
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wide">Daily Zen</h3>
            <p className="text-white/60 text-xs">{challenge.description}</p>
          </div>
        </div>

        {challenge.completed ? (
          <div className="mt-2 flex items-center gap-2 text-amber-300 text-xs font-medium animate-pulse">
            <CheckCircle size={14} />
            <span>Reward Active: {challenge.rewardLabel}</span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-white/40 mb-1 uppercase tracking-wider">
              <span>Progress</span>
              <span>{Math.floor(challenge.progress)} / {challenge.target}</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeHud;
