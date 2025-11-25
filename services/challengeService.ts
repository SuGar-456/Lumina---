import { DailyChallenge } from '../types';

const STORAGE_KEY = 'lumina_daily_challenge';

export const getDailyChallenge = (): DailyChallenge => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    const parsed = JSON.parse(stored) as DailyChallenge;
    if (parsed.id === today) {
      return parsed;
    }
  }

  // Generate new challenge for today
  // We use the date char codes to pseudo-randomize the challenge type so it's same for everyone locally
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const type: 'collect' | 'focus' = seed % 2 === 0 ? 'collect' : 'focus';

  const newChallenge: DailyChallenge = type === 'collect' 
    ? {
        id: today,
        type: 'collect',
        description: "Gather floating Spirit Orbs",
        target: 15,
        progress: 0,
        completed: false,
        rewardLabel: "Golden Stardust Trail"
      }
    : {
        id: today,
        type: 'focus',
        description: "Hold click to Meditate (seconds)",
        target: 60,
        progress: 0,
        completed: false,
        rewardLabel: "Golden Stardust Trail"
      };

  saveChallenge(newChallenge);
  return newChallenge;
};

export const saveChallenge = (challenge: DailyChallenge) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
};
