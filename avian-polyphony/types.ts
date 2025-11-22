
export enum BirdState {
  IDLE = 'IDLE',
  FLYING = 'FLYING',
  SINGING = 'SINGING',
  FORAGING = 'FORAGING',
}

export enum BirdCallType {
  SOCIAL = 'SOCIAL',
  MATING = 'MATING',
  TERRITORIAL = 'TERRITORIAL',
}

export enum BirdActionType {
  FEED = 'FEED',
  DISTRACT = 'DISTRACT'
}

export enum ViewMode {
  ORBIT = 'ORBIT',
  FPS = 'FPS',
  FOLLOW = 'FOLLOW'
}

export interface SimSettings {
  speed: number;
  agility: number;
  renderDistance: number;
  showFlocking: boolean;
}

export interface EvolutionSettings {
  enabled: boolean;
  agingSpeed: number;
  mutationRate: number;
  foodAbundance: number;
}

export interface SpeciesParams {
  color: string;
  scale: number;
  pitch: number;
  name?: string;
}

export type WorldCommand = 
  | { type: 'ADD', count: number } 
  | { type: 'REMOVE', count: number } 
  | { type: 'SELECT_RANDOM' }
  | { type: 'INTRODUCE_SPECIES', count: number, params: SpeciesParams }
  | null;

export interface SimulationStats {
  population: number;
  flockCount: number;
  activeVoices: number;
  averageHeight: number;
  foragingCount: number;
  maxGeneration: number;
  avgEnergy: number;
}

export interface HistoryPoint {
  timestamp: number; // Relative time or Date.now()
  population: number;
  voices: number;
  foraging: number;
  avgEnergy: number;
}

export interface BirdData {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
  state: BirdState;
  scale: number; // Genetic max size
  pitch: number; // Base pitch for audio
  melody: number[]; // Array of intervals
  lastChirp: number;
  lastAction?: { type: BirdActionType, time: number };
  
  // Evolution Traits
  age: number;
  maxAge: number;
  energy: number;
  generation: number;
}

export interface TreeData {
  id: string;
  position: [number, number, number];
  scale: number;
  type: 'pine' | 'oak';
}

export interface BirdAnalysis {
  speciesName: string;
  scientificName: string;
  description: string;
  temperament: string;
}