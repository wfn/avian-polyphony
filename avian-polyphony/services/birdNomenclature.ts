import { BirdData, BirdAnalysis, BirdState } from "../types";

// Helper to mark fallback values with visual distinction
function markFallback(value: string, isFallback: boolean): string {
  if (isFallback) {
    return `<span style="opacity: 0.6; text-decoration: underline dotted;" title="Generated using fallback value">${value}</span>`;
  }
  return value;
}

// ============================================================================
// COLOR CLASSIFICATION (~25 distinct families)
// ============================================================================

interface ColorFamily {
  name: string;
  latinRoot: string; // For scientific names
  descriptors: string[]; // For common names
}

const COLOR_FAMILIES: ColorFamily[] = [
  { name: 'Crimson', latinRoot: 'rubeus', descriptors: ['Ruby', 'Crimson', 'Scarlet', 'Carmine'] },
  { name: 'Vermilion', latinRoot: 'miniatus', descriptors: ['Vermilion', 'Coral', 'Flame', 'Burnt-Orange'] },
  { name: 'Amber', latinRoot: 'aureus', descriptors: ['Amber', 'Honey', 'Golden', 'Saffron'] },
  { name: 'Citrine', latinRoot: 'citrinus', descriptors: ['Lemon', 'Citrine', 'Sulfur', 'Pale-Gold'] },
  { name: 'Chartreuse', latinRoot: 'flavoviridis', descriptors: ['Chartreuse', 'Lime', 'Spring', 'Acid-Green'] },
  { name: 'Emerald', latinRoot: 'smaragdinus', descriptors: ['Emerald', 'Forest', 'Verdant', 'Jade'] },
  { name: 'Viridian', latinRoot: 'viridis', descriptors: ['Viridian', 'Moss', 'Olive', 'Sage'] },
  { name: 'Teal', latinRoot: 'cyanoviridis', descriptors: ['Teal', 'Turquoise', 'Aqua', 'Seafoam'] },
  { name: 'Cerulean', latinRoot: 'caeruleus', descriptors: ['Cerulean', 'Azure', 'Sky', 'Powder-Blue'] },
  { name: 'Cobalt', latinRoot: 'cobalinus', descriptors: ['Cobalt', 'Sapphire', 'Royal', 'Deep-Blue'] },
  { name: 'Indigo', latinRoot: 'indicus', descriptors: ['Indigo', 'Navy', 'Midnight', 'Prussian'] },
  { name: 'Violet', latinRoot: 'violaceus', descriptors: ['Violet', 'Lavender', 'Periwinkle', 'Lilac'] },
  { name: 'Magenta', latinRoot: 'purpureus', descriptors: ['Magenta', 'Fuchsia', 'Orchid', 'Plum'] },
  { name: 'Rose', latinRoot: 'roseus', descriptors: ['Rose', 'Pink', 'Blush', 'Salmon'] },
  { name: 'Umber', latinRoot: 'brunneus', descriptors: ['Umber', 'Sepia', 'Rust', 'Chestnut'] },
  { name: 'Sienna', latinRoot: 'ferrugineus', descriptors: ['Sienna', 'Copper', 'Burnt-Sienna', 'Terra-Cotta'] },
  { name: 'Ochre', latinRoot: 'ochraceus', descriptors: ['Ochre', 'Tan', 'Sand', 'Buff'] },
  { name: 'Ash', latinRoot: 'cinereus', descriptors: ['Ash', 'Slate', 'Storm', 'Smoke'] },
  { name: 'Pearl', latinRoot: 'argenteus', descriptors: ['Pearl', 'Silver', 'Platinum', 'Moonlit'] },
  { name: 'Ivory', latinRoot: 'eburneus', descriptors: ['Ivory', 'Cream', 'Bone', 'Alabaster'] },
  { name: 'Snow', latinRoot: 'niveus', descriptors: ['Snow', 'Frost', 'Ice', 'Pale'] },
  { name: 'Charcoal', latinRoot: 'anthracinus', descriptors: ['Charcoal', 'Graphite', 'Iron', 'Steel'] },
  { name: 'Obsidian', latinRoot: 'niger', descriptors: ['Obsidian', 'Onyx', 'Raven', 'Ink'] },
  { name: 'Copper', latinRoot: 'cupreus', descriptors: ['Copper', 'Bronze', 'Brass', 'Metallic'] },
  { name: 'Opal', latinRoot: 'iridescens', descriptors: ['Opal', 'Iridescent', 'Prismatic', 'Rainbow'] },
];

// ============================================================================
// GENUS CLASSIFICATION (by behavioral/trait families)
// ============================================================================

interface GenusGroup {
  genera: string[];
  theme: string; // Vocal, Aerial, Ground, etc.
}

const GENUS_GROUPS: GenusGroup[] = [
  { genera: ['Sonolumen', 'Cantorus', 'Melodius', 'Vocalis'], theme: 'vocal' }, // High-pitched singers
  { genera: ['Altivolans', 'Aerius', 'Nimbovis', 'Caelifer'], theme: 'aerial' }, // High-altitude flyers
  { genera: ['Terrestrior', 'Solumvis', 'Humicolus', 'Rasorus'], theme: 'ground' }, // Ground foragers
  { genera: ['Crepusculis', 'Aurornis', 'Vesperus', 'Tenebris'], theme: 'temporal' }, // Time-associated
  { genera: ['Gregarius', 'Sociabilis', 'Solitarius', 'Dispersus'], theme: 'social' }, // Flock behavior
  { genera: ['Rapidus', 'Velox', 'Tranquillus', 'Lentus'], theme: 'speed' }, // Movement tempo
];

// ============================================================================
// SPECIES EPITHETS (combining size/pitch/habitat)
// ============================================================================

const SIZE_EPITHETS = {
  small: ['minimus', 'parvus', 'gracilis', 'tenuissimus', 'delicatus'],
  medium: ['medius', 'communis', 'typicus', 'ordinarius', 'moderatus'],
  large: ['maximus', 'grandis', 'robustus', 'magnificus', 'imperialis']
};

const PITCH_EPITHETS = {
  low: ['gravis', 'profundus', 'bassus', 'sonorus'],
  mid: ['melodicus', 'harmonius', 'dulcis', 'cantans'],
  high: ['acutus', 'stridulus', 'crystallinus', 'argentus']
};

const BEHAVIOR_EPITHETS = [
  'volans', 'cantrix', 'forans', 'perchis', 'erratus',
  'vagans', 'saltans', 'exploratus', 'vigilans', 'choralis'
];

// ============================================================================
// COMMON NAME COMPONENTS
// ============================================================================

const BEHAVIOR_DESCRIPTORS = [
  // Vocal
  'Chime', 'Warbler', 'Singer', 'Caller', 'Whistler', 'Songster', 'Crooner',
  // Movement
  'Flitter', 'Dancer', 'Glider', 'Darter', 'Soarer', 'Hopper', 'Wanderer',
  // Location
  'Sky-Dweller', 'Canopy-Walker', 'Ground-Runner', 'Forest-Ghost', 'Treetop-Visitor',
  // Temporal
  'Dawn-Caller', 'Dusk-Singer', 'Twilight-Wanderer', 'Morning-Voice', 'Evening-Chime',
  // Aesthetic
  'Jewel', 'Gem', 'Shimmer', 'Gleam', 'Sparkle', 'Flash'
];

const BIRD_TYPES = [
  // Naturalist terms
  'Thrush', 'Finch', 'Warbler', 'Sparrow', 'Bunting', 'Tanager', 'Wren',
  'Pipit', 'Wagtail', 'Lark', 'Chat', 'Blackbird', 'Robin', 'Starling',
  // Poetic terms
  'Wing', 'Feather', 'Plume', 'Bird', 'Flier', 'Aviator'
];

// ============================================================================
// DETERMINISTIC HASHING: Map bird traits to species identity
// ============================================================================

interface SpeciesIdentity {
  colorFamily: ColorFamily;
  sizeCategory: 'small' | 'medium' | 'large';
  pitchCategory: 'low' | 'mid' | 'high';
  genusGroup: GenusGroup;
  behaviorTendency: 'vocal' | 'aerial' | 'ground' | 'temporal' | 'social' | 'speed';
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s, l };
}

function safeFind<T>(array: T[], predicate: (item: T) => boolean, fallback: T): T {
  const result = array.find(predicate);
  return result ?? fallback;
}

function getColorFamily(hex: string): ColorFamily {
  const hsl = hexToHSL(hex);
  const h = hsl.h;
  const s = hsl.s;
  const l = hsl.l;

  const pearl = COLOR_FAMILIES[18]; // Pearl as ultimate fallback

  // Achromatic (low saturation)
  if (s < 0.15) {
    if (l > 0.85) return safeFind(COLOR_FAMILIES, f => f.name === 'Snow', pearl);
    if (l > 0.7) return safeFind(COLOR_FAMILIES, f => f.name === 'Ivory', pearl);
    if (l > 0.55) return safeFind(COLOR_FAMILIES, f => f.name === 'Pearl', pearl);
    if (l > 0.4) return safeFind(COLOR_FAMILIES, f => f.name === 'Ash', pearl);
    if (l > 0.25) return safeFind(COLOR_FAMILIES, f => f.name === 'Charcoal', pearl);
    return safeFind(COLOR_FAMILIES, f => f.name === 'Obsidian', pearl);
  }

  // Chromatic (by hue)
  if (h >= 345 || h < 15) return safeFind(COLOR_FAMILIES, f => f.name === 'Crimson', pearl);
  if (h < 25) return safeFind(COLOR_FAMILIES, f => f.name === 'Vermilion', pearl);
  if (h < 45) return safeFind(COLOR_FAMILIES, f => f.name === 'Amber', pearl);
  if (h < 60) return safeFind(COLOR_FAMILIES, f => f.name === 'Citrine', pearl);
  if (h < 75) return safeFind(COLOR_FAMILIES, f => f.name === 'Chartreuse', pearl);
  if (h < 105) return safeFind(COLOR_FAMILIES, f => f.name === 'Emerald', pearl);
  if (h < 135) return safeFind(COLOR_FAMILIES, f => f.name === 'Viridian', pearl);
  if (h < 165) return safeFind(COLOR_FAMILIES, f => f.name === 'Teal', pearl);
  if (h < 195) return safeFind(COLOR_FAMILIES, f => f.name === 'Cerulean', pearl);
  if (h < 225) return safeFind(COLOR_FAMILIES, f => f.name === 'Cobalt', pearl);
  if (h < 255) return safeFind(COLOR_FAMILIES, f => f.name === 'Indigo', pearl);
  if (h < 275) return safeFind(COLOR_FAMILIES, f => f.name === 'Violet', pearl);
  if (h < 295) return safeFind(COLOR_FAMILIES, f => f.name === 'Magenta', pearl);
  if (h < 315) return safeFind(COLOR_FAMILIES, f => f.name === 'Rose', pearl);

  // Browns/earthy tones (moderate saturation, moderate lightness)
  if (s < 0.5 && l < 0.6) {
    if (h < 30) return safeFind(COLOR_FAMILIES, f => f.name === 'Sienna', pearl);
    if (h < 45) return safeFind(COLOR_FAMILIES, f => f.name === 'Copper', pearl);
    if (h < 60) return safeFind(COLOR_FAMILIES, f => f.name === 'Ochre', pearl);
    return safeFind(COLOR_FAMILIES, f => f.name === 'Umber', pearl);
  }

  // Metallic/iridescent (high lightness, moderate-high saturation)
  if (l > 0.6 && s > 0.3) {
    return safeFind(COLOR_FAMILIES, f => f.name === 'Opal', pearl);
  }

  // Default fallback
  return pearl;
}

function getSizeCategory(scale: number): 'small' | 'medium' | 'large' {
  if (scale < 0.8) return 'small';
  if (scale > 1.2) return 'large';
  return 'medium';
}

function getPitchCategory(pitch: number): 'low' | 'mid' | 'high' {
  if (pitch < 500) return 'low';
  if (pitch > 1000) return 'high';
  return 'mid';
}

function getGenusGroupForBird(bird: BirdData): GenusGroup {
  const pitchCat = getPitchCategory(bird.pitch);
  const sizeCat = getSizeCategory(bird.scale);
  const defaultGroup = GENUS_GROUPS[0]; // Vocal as default fallback

  // Prioritize vocal genus for high-pitched birds
  if (pitchCat === 'high') {
    return safeFind(GENUS_GROUPS, g => g.theme === 'vocal', defaultGroup);
  }

  // Prioritize ground genus for foraging birds
  if (bird.state === BirdState.FORAGING) {
    return safeFind(GENUS_GROUPS, g => g.theme === 'ground', defaultGroup);
  }

  // Prioritize aerial genus for large flying birds
  if (sizeCat === 'large' && bird.state === BirdState.FLYING) {
    return safeFind(GENUS_GROUPS, g => g.theme === 'aerial', defaultGroup);
  }

  // Use a deterministic hash to pick among remaining
  const hash = Math.floor(bird.color.charCodeAt(1) + bird.pitch + bird.scale * 100) % GENUS_GROUPS.length;
  return GENUS_GROUPS[hash] || defaultGroup;
}

function getSpeciesIdentity(bird: BirdData): SpeciesIdentity {
  const colorFamily = getColorFamily(bird.color);
  const sizeCategory = getSizeCategory(bird.scale);
  const pitchCategory = getPitchCategory(bird.pitch);
  const genusGroup = getGenusGroupForBird(bird);

  return {
    colorFamily,
    sizeCategory,
    pitchCategory,
    genusGroup,
    behaviorTendency: genusGroup.theme as any
  };
}

// ============================================================================
// NAME GENERATION
// ============================================================================

function generateScientificName(identity: SpeciesIdentity, bird: BirdData): string {
  // Genus selection (deterministic within group)
  const hasGenusGroup = !!identity.genusGroup?.genera;
  const genera = identity.genusGroup?.genera || ['Avis'];
  const genusIndex = Math.floor(Math.abs(bird.color.charCodeAt(1) + bird.pitch)) % genera.length;
  const genusBase = genera[genusIndex];
  const genusFallback = !genusBase;
  const genus = genusBase || 'Avis';

  // Species epithet (combining size and pitch)
  const hasSizeEpithet = !!SIZE_EPITHETS[identity.sizeCategory];
  const sizeEpithet = SIZE_EPITHETS[identity.sizeCategory] || SIZE_EPITHETS.medium;
  const hasPitchEpithet = !!PITCH_EPITHETS[identity.pitchCategory];
  const pitchEpithet = PITCH_EPITHETS[identity.pitchCategory] || PITCH_EPITHETS.mid;

  const sizeIndex = Math.abs(bird.color.charCodeAt(2)) % sizeEpithet.length;
  const pitchIndex = Math.floor(Math.abs(bird.pitch)) % pitchEpithet.length;

  const sizeBase = sizeEpithet[sizeIndex];
  const sizeFallback = !sizeBase;
  const selectedSize = sizeBase || sizeEpithet[0] || 'communis';

  const pitchBase = pitchEpithet[pitchIndex];
  const pitchFallback = !pitchBase;
  const selectedPitch = pitchBase || pitchEpithet[0] || 'cantans';

  console.log('[BirdNomenclature] Scientific Name Generation:', {
    birdId: bird.id,
    color: bird.color,
    pitch: bird.pitch,
    scale: bird.scale,
    pitchCategory: identity.pitchCategory,
    sizeCategory: identity.sizeCategory,
    genus,
    selectedSize,
    selectedPitch,
    fallbacks: {
      genus: genusFallback || !hasGenusGroup,
      size: sizeFallback || !hasSizeEpithet,
      pitch: pitchFallback || !hasPitchEpithet
    }
  });

  // Sometimes use color Latin root as species epithet
  const useColor = Math.floor(bird.scale * 100 + bird.pitch) % 3 === 0;

  if (useColor && identity.colorFamily?.latinRoot) {
    const genusMarked = markFallback(genus, genusFallback || !hasGenusGroup);
    return `${genusMarked} ${identity.colorFamily.latinRoot}`;
  }

  // Combine size + pitch, or pitch + behavior
  const useBehavior = Math.floor(bird.pitch) % 2 === 0;
  if (useBehavior) {
    const behaviorIndex = Math.abs(bird.color.charCodeAt(3)) % BEHAVIOR_EPITHETS.length;
    const behaviorBase = BEHAVIOR_EPITHETS[behaviorIndex];
    const behaviorFallback = !behaviorBase;
    const selectedBehavior = behaviorBase || BEHAVIOR_EPITHETS[0] || 'volans';

    const genusMarked = markFallback(genus, genusFallback || !hasGenusGroup);
    const pitchMarked = markFallback(selectedPitch, pitchFallback || !hasPitchEpithet);
    const behaviorMarked = markFallback(selectedBehavior, behaviorFallback);
    return `${genusMarked} ${pitchMarked}-${behaviorMarked}`;
  }

  const genusMarked = markFallback(genus, genusFallback || !hasGenusGroup);
  const sizeMarked = markFallback(selectedSize, sizeFallback || !hasSizeEpithet);
  const pitchMarked = markFallback(selectedPitch, pitchFallback || !hasPitchEpithet);
  return `${genusMarked} ${sizeMarked}-${pitchMarked}`;
}

function generateCommonName(identity: SpeciesIdentity, bird: BirdData): string {
  // Color descriptor
  const colorDescriptors = identity.colorFamily?.descriptors || ['Unknown'];
  const colorIndex = Math.abs(bird.color.charCodeAt(2)) % colorDescriptors.length;
  const colorDesc = colorDescriptors[colorIndex] || 'Unknown';

  // Behavior descriptor
  const behaviorIndex = (Math.floor(Math.abs(bird.pitch)) + bird.color.charCodeAt(1)) % BEHAVIOR_DESCRIPTORS.length;
  const behaviorDesc = BEHAVIOR_DESCRIPTORS[behaviorIndex] || 'Bird';

  // Bird type
  const typeIndex = (Math.floor(Math.abs(bird.pitch)) + Math.floor(bird.scale * 100)) % BIRD_TYPES.length;
  const birdType = BIRD_TYPES[typeIndex] || 'Bird';

  // Format patterns (deterministic selection)
  const pattern = Math.floor(bird.pitch + bird.color.charCodeAt(3)) % 4;

  switch (pattern) {
    case 0: return `${colorDesc} ${birdType}`; // "Golden Warbler"
    case 1: return `${colorDesc} ${behaviorDesc}`; // "Golden Dawn-Caller"
    case 2: return `${behaviorDesc} ${birdType}`; // "Dawn-Caller Warbler" (less common but naturalist)
    case 3: return `${colorDesc}-${behaviorDesc.split('-')[0]} ${birdType}`; // "Golden-Dawn Warbler"
    default: return `${colorDesc} ${birdType}`;
  }
}

// ============================================================================
// DESCRIPTION GENERATION
// ============================================================================

function generateDescription(identity: SpeciesIdentity, bird: BirdData): string {
  const colorName = identity.colorFamily?.name || 'unknown';
  const colorNameLower = colorName.toLowerCase();
  const pitchRounded = Math.round(bird.pitch);

  // Create colored span for hex color display
  const colorDisplay = `<span style="color: ${bird.color}; font-weight: bold;">coloration</span>`;

  const templates = [
    `The ${colorName} plumage of this ${identity.sizeCategory}-bodied bird creates a striking silhouette against the forest canopy. With a base pitch frequency of approximately ${pitchRounded}Hz, its calls occupy a ${identity.pitchCategory === 'high' ? 'remarkably elevated' : identity.pitchCategory === 'low' ? 'deep and resonant' : 'middle'} register in the avian soundscape. Often observed ${bird.state === BirdState.FORAGING ? 'foraging on the forest floor' : bird.state === BirdState.SINGING ? 'engaging in extended vocal displays' : 'in sustained flight'}, this species demonstrates ${bird.energy > 60 ? 'vigorous' : bird.energy > 30 ? 'moderate' : 'conservative'} energy expenditure. The plumage displays a rich ${colorDisplay}, which may serve ${identity.pitchCategory === 'high' ? 'both territorial and mate-attraction functions' : 'primarily as camouflage within its preferred habitat'}.`,

    `A ${identity.sizeCategory}-statured bird characterized by its ${colorNameLower} feathering (hex: ${bird.color}). This species exhibits ${identity.pitchCategory}-frequency vocalizations around ${pitchRounded}Hz, suggesting ${identity.behaviorTendency === 'vocal' ? 'highly developed syrinx musculature adapted for complex song production' : identity.behaviorTendency === 'aerial' ? 'adaptations for long-distance communication during extended flight' : 'communication patterns suited to dense vegetation'}. Field observations indicate a ${bird.energy > 50 ? 'robust and active' : 'measured and deliberate'} foraging strategy. Specimens typically scale at approximately ${bird.scale.toFixed(2)}x standard reference size.`,

    `Rarely catalogued until recent surveys, this ${colorNameLower}-hued species presents a fascinating study in ecological adaptation. Its ${identity.pitchCategory}-pitched call at ${pitchRounded}Hz creates ${identity.pitchCategory === 'high' ? 'an almost crystalline resonance' : identity.pitchCategory === 'low' ? 'a commanding presence in the lower auditory spectrum' : 'harmonious mid-range tones'}. The bird's ${identity.sizeCategory} frame ${identity.sizeCategory === 'large' ? 'dominates its local territory' : identity.sizeCategory === 'small' ? 'allows for remarkable agility in dense foliage' : 'provides optimal balance between maneuverability and endurance'}. Currently observed with ${Math.floor(bird.energy)}% energy reserves, exhibiting ${bird.state.toLowerCase()} behavior typical of the species.`,

    `Distinguished by plumage that displays ${colorDisplay} and catches light with ${colorNameLower} undertones, this ${identity.sizeCategory}-bodied specimen vocalizes at approximately ${pitchRounded}Hz. Such ${identity.pitchCategory}-frequency calls are characteristic of species ${identity.behaviorTendency === 'vocal' ? 'that rely heavily on acoustic signaling for social cohesion' : identity.behaviorTendency === 'ground' ? 'adapted to communicate across variable terrain' : 'evolved for their specific ecological niche'}. Behavioral observations note ${bird.state === BirdState.FLYING ? 'prolonged flight periods' : bird.state === BirdState.FORAGING ? 'dedicated ground-foraging sessions' : bird.state === BirdState.SINGING ? 'frequent territorial song displays' : 'alternating active and resting phases'} as primary activity patterns.`
  ];

  // Deterministic template selection
  const templateIndex = Math.floor(bird.pitch + bird.color.charCodeAt(1) + Math.floor(bird.scale * 100)) % templates.length;
  return templates[templateIndex] || templates[0];
}

function generateTemperament(identity: SpeciesIdentity, bird: BirdData): string {
  // Base temperament on behavior tendency and current state
  const temperaments: Record<string, string[]> = {
    vocal: ['Vociferous and territorial', 'Melodious yet assertive', 'Gregarious and communicative', 'Animated and expressive'],
    aerial: ['Restless and exploratory', 'Graceful yet independent', 'Aloof and high-ranging', 'Confident in open spaces'],
    ground: ['Methodical and cautious', 'Focused and pragmatic', 'Grounded and observant', 'Deliberate in movement'],
    temporal: ['Rhythmic and predictable', 'Sensitive to environmental cues', 'Cyclical in behavior patterns', 'Attuned to daily rhythms'],
    social: ['Gregarious and cooperative', 'Socially complex and interactive', 'Community-oriented', 'Highly responsive to flock dynamics'],
    speed: ['Dynamic and energetic', 'Swift and decisive', 'Measured and composed', 'Adaptable in tempo']
  };

  const defaultOptions = temperaments.vocal;
  const options = temperaments[identity.behaviorTendency] || defaultOptions;
  const index = Math.floor(bird.pitch + Math.floor(bird.energy)) % options.length;
  let baseTemperament = options[index] || 'Alert and adaptive';

  // Add energy-based modifier
  if (bird.energy > 70) {
    baseTemperament += ', displaying high vitality';
  } else if (bird.energy < 30) {
    baseTemperament += ', currently conserving energy';
  }

  // Add state-based observation
  if (bird.state === BirdState.SINGING) {
    baseTemperament += '. Frequently engages in vocal displays';
  } else if (bird.state === BirdState.FORAGING) {
    baseTemperament += '. Spends considerable time foraging';
  }

  return baseTemperament + '.';
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export function generateBirdAnalysis(bird: BirdData): BirdAnalysis {
  console.log('[BirdNomenclature] Analyzing bird:', {
    id: bird.id,
    color: bird.color,
    pitch: bird.pitch,
    scale: bird.scale,
    state: bird.state,
    energy: bird.energy
  });

  const identity = getSpeciesIdentity(bird);

  console.log('[BirdNomenclature] Species identity:', {
    colorFamily: identity.colorFamily?.name,
    sizeCategory: identity.sizeCategory,
    pitchCategory: identity.pitchCategory,
    genusGroup: identity.genusGroup?.theme,
    behaviorTendency: identity.behaviorTendency
  });

  const result = {
    scientificName: generateScientificName(identity, bird),
    speciesName: generateCommonName(identity, bird),
    description: generateDescription(identity, bird),
    temperament: generateTemperament(identity, bird)
  };

  console.log('[BirdNomenclature] Generated names:', {
    scientificName: result.scientificName,
    speciesName: result.speciesName
  });

  return result;
}
