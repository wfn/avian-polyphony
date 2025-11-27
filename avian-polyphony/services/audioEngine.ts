import * as Tone from 'tone';
import { BirdCallType } from '../types';

class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    await Tone.start();

    // Stereo delay for forest ambience feeling
    this.delay = new Tone.FeedbackDelay({
      delayTime: "8n",
      feedback: 0.2,
      wet: 0.1
    });

    // Reverb for distance
    this.reverb = new Tone.Reverb({
      decay: 2.5,
      preDelay: 0.01,
      wet: 0.3,
    }).toDestination();

    this.delay.connect(this.reverb);

    // Using a Sine oscillator with a short envelope mimics a bird's syrinx whistle well
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.02, // Soft attack
        decay: 0.1,
        sustain: 0.0,
        release: 0.1,
      },
      volume: -8,
    }).connect(this.delay);

    this.isInitialized = true;
  }

  playCall(pitch: number, melody: number[], type: BirdCallType) {
    if (!this.synth || !this.isInitialized) return;

    const now = Tone.now();
    
    // Random micro-variation to pitch to make it organic
    const organicPitch = pitch + (Math.random() * 20 - 10);

    switch (type) {
      case BirdCallType.MATING:
        // Mating: A pleasant, melodic sequence (Arpeggio)
        // Play the bird's unique melody property
        melody.forEach((interval, index) => {
          const freq = organicPitch * interval;
          const duration = 0.15;
          const time = now + (index * 0.18); // Slower pace
          this.synth?.triggerAttackRelease(freq, duration, time);
        });
        // Resolve with a root note
        this.synth?.triggerAttackRelease(organicPitch * 2, 0.2, now + (melody.length * 0.18));
        break;

      case BirdCallType.TERRITORIAL:
        // Territorial: Rapid, staccato, slightly aggressive/urgent
        // A trill (repeating notes fast)
        for (let i = 0; i < 5; i++) {
          // Alternating pitch slightly creates a "rattle" effect
          const freq = i % 2 === 0 ? organicPitch : organicPitch * 1.1; 
          this.synth?.triggerAttackRelease(freq, 0.04, now + (i * 0.06));
        }
        break;

      case BirdCallType.SOCIAL:
      default:
        // Social: Simple "peep" or double chirp
        this.synth?.triggerAttackRelease(organicPitch, 0.08, now);
        // 30% chance of double chirp
        if (Math.random() > 0.7) {
           this.synth?.triggerAttackRelease(organicPitch * 1.2, 0.08, now + 0.12);
        }
        break;
    }
  }

  stop() {
    this.synth?.dispose();
    this.reverb?.dispose();
    this.delay?.dispose();
    this.isInitialized = false;
  }
}

export const audioEngine = new AudioEngine();