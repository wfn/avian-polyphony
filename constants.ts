
import { BirdCallType } from "./types";

export const WORLD_SIZE = 250; // Increased for larger exploration area
export const BIRD_COUNT = 40; // Increased population
export const TREE_COUNT = 150; // Increased density

export const BIRD_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#F7D794', // Yellow
  '#786FA6', // Purple
  '#F19066', // Orange
];

export const BIRD_SPEED = 0.15;
export const PERCEPTION_RADIUS = 10;
export const SEPARATION_DISTANCE = 2;

// Audio constants
export const BASE_FREQ = 500; // Slightly higher base for bird chirps
export const MELODY_LENGTH = 4;

// Evolution Constants
export const INITIAL_ENERGY = 60;
export const MAX_ENERGY = 100;
export const METABOLIC_RATE = 2.0; // Energy loss per second
export const FORAGING_RATE = 15.0; // Energy gain per second when foraging
export const REPRODUCTION_THRESHOLD = 90; // Energy needed to reproduce
export const REPRODUCTION_COST = 40; // Energy lost when reproducing
export const MATURATION_AGE = 15; // Seconds until full size/reproduction capable

// Visual properties for different call types
export const CALL_PROPERTIES = {
  [BirdCallType.SOCIAL]: { 
    color: '#A4F0F2', // Soft Cyan
    speed: 10,
    maxScale: 6 
  },
  [BirdCallType.MATING]: { 
    color: '#F472B6', // Soft Pink
    speed: 5,       // Slower expansion
    maxScale: 10 
  },
  [BirdCallType.TERRITORIAL]: { 
    color: '#EF4444', // Alert Red
    speed: 18,      // Fast expansion
    maxScale: 8 
  }
};