export interface Theme {
  name: string;
  colors: string[];
  speed: number;
  flowType: 'calm' | 'energetic' | 'focused' | 'dreamy';
  message: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  friction: number;
}

export type ChallengeType = 'collect' | 'focus';

export interface DailyChallenge {
  id: string; // Date string YYYY-MM-DD
  type: ChallengeType;
  description: string;
  target: number; // e.g., 20 items or 60 seconds
  progress: number;
  completed: boolean;
  rewardLabel: string;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  radius: number;
  pulseOffset: number;
  collected: boolean;
}

// New Entity: Stress Knots (The "Enemies" to dissolve)
export interface StressBlob {
  id: number;
  x: number;
  y: number;
  radius: number;
  originalRadius: number;
  health: number;
  vx: number;
  vy: number;
}

// New Effect: Shockwaves
export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

// New Feature: Gravity Wells
export interface GravityWell {
  id: number;
  x: number;
  y: number;
  strength: number;
  life: number; // Lowers over time
}

// New Feature: Wind Painting
export interface WindStroke {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}