
import React, { useState, useCallback, useRef } from 'react';
import { World } from './components/World';
import { audioEngine } from './services/audioEngine';
import { analyzeBird } from './services/geminiService';
import { PopulationChart } from './components/PopulationChart';
import { BirdData, BirdAnalysis, BirdActionType, ViewMode, SimSettings, SimulationStats, EvolutionSettings, WorldCommand, HistoryPoint } from './types';
import { Volume2, VolumeX, Info, X, Music, Bird as BirdIcon, Sparkles, Cookie, Megaphone, Eye, Globe, Video, Shuffle, SlidersHorizontal, Wind, Play, Pause, Activity, Users, Mic, Mountain, Dna, Zap, Timer, Sprout, Plus, Minus, TestTube, Settings2, Palette, Signal, LayoutDashboard, Network } from 'lucide-react';

// --- Reusable Panel Components ---

interface FlightPanelProps {
  settings: SimSettings;
  setSettings: React.Dispatch<React.SetStateAction<SimSettings>>;
}
const FlightPanel: React.FC<FlightPanelProps> = ({ settings, setSettings }) => (
  <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white/80 shadow-xl w-64 animate-fade-in-down">
      <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
          <Wind size={14} /> Flight Parameters
      </h3>
      
      <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
              <span>Velocity</span>
              <span className="text-green-400 font-mono">{settings.speed.toFixed(2)}x</span>
          </div>
          <input 
              type="range" 
              min="0.05" 
              max="3.0" 
              step="0.05"
              value={settings.speed}
              onChange={(e) => setSettings(s => ({...s, speed: parseFloat(e.target.value)}))}
              className="w-full accent-green-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
      </div>

      <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
              <span>Agility</span>
              <span className="text-blue-400 font-mono">{settings.agility.toFixed(2)}x</span>
          </div>
          <input 
              type="range" 
              min="0.05" 
              max="3.0" 
              step="0.05"
              value={settings.agility}
              onChange={(e) => setSettings(s => ({...s, agility: parseFloat(e.target.value)}))}
              className="w-full accent-blue-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
      </div>

      <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
              <span>Visibility</span>
              <span className="text-purple-400 font-mono">{settings.renderDistance.toFixed(0)}m</span>
          </div>
          <input 
              type="range" 
              min="50" 
              max="500" 
              step="10"
              value={settings.renderDistance}
              onChange={(e) => setSettings(s => ({...s, renderDistance: parseFloat(e.target.value)}))}
              className="w-full accent-purple-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs flex items-center gap-2">
             <Network size={12} />
             <span>Flocking Network</span>
          </div>
          <button 
              onClick={() => setSettings(s => ({...s, showFlocking: !s.showFlocking}))}
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${settings.showFlocking ? 'bg-blue-500' : 'bg-white/20'}`}
          >
              <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${settings.showFlocking ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
      </div>
  </div>
);

interface EvolutionPanelProps {
  settings: EvolutionSettings;
  setSettings: React.Dispatch<React.SetStateAction<EvolutionSettings>>;
  stats: SimulationStats;
  onPopChange: (type: 'ADD' | 'REMOVE') => void;
}
const EvolutionPanel: React.FC<EvolutionPanelProps> = ({ settings, setSettings, stats, onPopChange }) => (
  <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-pink-500/20 text-white/80 shadow-xl w-72 animate-fade-in-down">
      <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
              <Dna size={14} className="text-pink-400"/> Evolution Logic
          </h3>
          <button 
              onClick={() => setSettings(s => ({...s, enabled: !s.enabled}))}
              className={`w-10 h-5 rounded-full p-1 transition-colors ${settings.enabled ? 'bg-pink-500' : 'bg-white/20'}`}
          >
              <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${settings.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
      </div>

      {/* Manual Population Control */}
      <div className="mb-4 pb-4 border-b border-white/10">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Population Control</div>
            <div className="flex items-center justify-between bg-white/5 rounded-lg p-1">
                <button 
                  onClick={() => onPopChange('REMOVE')}
                  className="p-2 hover:bg-red-500/20 text-red-300 rounded-md transition-colors"
                >
                    <Minus size={16} />
                </button>
                <span className="font-mono font-bold text-white">{stats.population}</span>
                <button 
                    onClick={() => onPopChange('ADD')}
                    className="p-2 hover:bg-green-500/20 text-green-300 rounded-md transition-colors"
                >
                    <Plus size={16} />
                </button>
            </div>
      </div>
      
      <div className={`space-y-4 transition-opacity ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div>
              <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1"><Timer size={10}/> Life Speed (Aging)</span>
                  <span className="text-pink-300 font-mono">{settings.agingSpeed.toFixed(1)}x</span>
              </div>
              <input 
                  type="range" 
                  min="0.1" 
                  max="5.0" 
                  step="0.1"
                  value={settings.agingSpeed}
                  onChange={(e) => setSettings(s => ({...s, agingSpeed: parseFloat(e.target.value)}))}
                  className="w-full accent-pink-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
          </div>

          <div>
              <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1"><Zap size={10}/> Mutation Rate</span>
                  <span className="text-yellow-300 font-mono">{(settings.mutationRate * 100).toFixed(0)}%</span>
              </div>
              <input 
                  type="range" 
                  min="0" 
                  max="1.0" 
                  step="0.05"
                  value={settings.mutationRate}
                  onChange={(e) => setSettings(s => ({...s, mutationRate: parseFloat(e.target.value)}))}
                  className="w-full accent-yellow-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
          </div>
          
          <div>
              <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1"><Sprout size={10}/> Food Abundance</span>
                  <span className="text-green-300 font-mono">{settings.foodAbundance.toFixed(1)}x</span>
              </div>
              <input 
                  type="range" 
                  min="0.1" 
                  max="3.0" 
                  step="0.1"
                  value={settings.foodAbundance}
                  onChange={(e) => setSettings(s => ({...s, foodAbundance: parseFloat(e.target.value)}))}
                  className="w-full accent-green-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
          </div>
      </div>
  </div>
);

interface SpeciesPanelProps {
  customSpecies: { color: string; scale: number; pitch: number };
  setCustomSpecies: React.Dispatch<React.SetStateAction<{ color: string; scale: number; pitch: number }>>;
  onMigrate: () => void;
  onIntroduce: () => void;
}
const SpeciesPanel: React.FC<SpeciesPanelProps> = ({ customSpecies, setCustomSpecies, onMigrate, onIntroduce }) => (
  <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-blue-500/20 text-white/80 shadow-xl w-72 animate-fade-in-down">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
            <TestTube size={14} className="text-blue-400"/> Species Discovery
        </h3>
        
        <div className="mb-5">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1">
                <Globe size={10}/> Procedural Migration
            </div>
            <p className="text-xs text-gray-400 mb-2 leading-tight">
                Simulate a flock of unknown species migrating into the region.
            </p>
            <button 
                onClick={onMigrate}
                className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
                <Wind size={14}/> Trigger Migration
            </button>
        </div>

        <div className="border-t border-white/10 pt-4">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-3 flex items-center gap-1">
                <Settings2 size={10}/> Genetic Engineering
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-2"><Palette size={12}/> Plumage</span>
                    <div className="relative w-8 h-6 overflow-hidden rounded cursor-pointer ring-1 ring-white/20">
                        <input 
                              type="color" 
                              value={customSpecies.color}
                              onChange={(e) => setCustomSpecies(s => ({...s, color: e.target.value}))}
                              className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                        />
                    </div>
                </div>

                <div>
                      <div className="flex justify-between text-xs mb-1">
                          <span>Body Scale</span>
                          <span className="font-mono text-white/60">{customSpecies.scale.toFixed(1)}x</span>
                      </div>
                      <input 
                          type="range" min="0.3" max="2.0" step="0.1"
                          value={customSpecies.scale}
                          onChange={(e) => setCustomSpecies(s => ({...s, scale: parseFloat(e.target.value)}))}
                          className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                </div>

                <div>
                      <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1"><Signal size={10}/> Pitch</span>
                          <span className="font-mono text-white/60">{Math.round(customSpecies.pitch)}Hz</span>
                      </div>
                      <input 
                          type="range" min="200" max="1200" step="50"
                          value={customSpecies.pitch}
                          onChange={(e) => setCustomSpecies(s => ({...s, pitch: parseFloat(e.target.value)}))}
                          className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono uppercase">
                          <span>Bass</span>
                          <span>Tenor</span>
                          <span>Soprano</span>
                      </div>
                </div>
                
                <button 
                    onClick={onIntroduce}
                    className="w-full mt-2 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                    <TestTube size={14}/> Synthesize & Release
                </button>
            </div>
        </div>
  </div>
);


function App() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedBird, setSelectedBird] = useState<BirdData | null>(null);
  const [followedBirdId, setFollowedBirdId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BirdAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ORBIT);
  
  // UI Panels
  const [dashboardMode, setDashboardMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showSpeciesPanel, setShowSpeciesPanel] = useState(false);

  const [simSettings, setSimSettings] = useState<SimSettings>({ 
      speed: 1, 
      agility: 1,
      renderDistance: 150,
      showFlocking: false
  });
  const [evolutionSettings, setEvolutionSettings] = useState<EvolutionSettings>({ 
      enabled: false, 
      agingSpeed: 1.0, 
      mutationRate: 0.1,
      foodAbundance: 1.0
  });
  
  // New Species creation state
  const [customSpecies, setCustomSpecies] = useState({
      color: '#ff8800',
      scale: 1.0,
      pitch: 500
  });

  const [worldCommand, setWorldCommand] = useState<WorldCommand>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Stats & History State
  const [stats, setStats] = useState<SimulationStats>({ 
    population: 0, 
    flockCount: 0, 
    activeVoices: 0, 
    averageHeight: 0, 
    foragingCount: 0,
    maxGeneration: 0,
    avgEnergy: 0
  });
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  
  const birdRegistry = useRef<Record<string, BirdAnalysis>>({});
  const [actionSignal, setActionSignal] = useState<{id: string, type: BirdActionType, time: number} | null>(null);

  const handleStart = async () => {
    await audioEngine.init();
    setAudioEnabled(true);
    setHasStarted(true);
  };

  const handleStatsUpdate = useCallback((newStats: SimulationStats) => {
      setStats(newStats);
      setHistory(prev => {
          const newPoint: HistoryPoint = {
              timestamp: Date.now(),
              population: newStats.population,
              voices: newStats.activeVoices,
              foraging: newStats.foragingCount,
              avgEnergy: newStats.avgEnergy
          };
          // Keep approximately 60 seconds of history (assuming 0.5s update rate -> 120 points)
          const newHistory = [...prev, newPoint];
          if (newHistory.length > 120) {
              newHistory.shift();
          }
          return newHistory;
      });
  }, []);

  const handleBirdSelect = useCallback(async (bird: BirdData) => {
    setSelectedBird(bird);
    
    // If we are already in follow mode, update the target immediately
    if (viewMode === ViewMode.FOLLOW) {
      setFollowedBirdId(bird.id);
    }

    if (birdRegistry.current[bird.id]) {
      setAnalysis(birdRegistry.current[bird.id]);
      return;
    }

    setAnalysis(null);
    setIsAnalyzing(true);
    
    try {
        const result = await analyzeBird(bird);
        birdRegistry.current[bird.id] = result;
        setAnalysis(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAnalyzing(false);
    }
  }, [viewMode]);

  const handleClosePanel = () => {
    setSelectedBird(null);
    setAnalysis(null);
  };
  
  const triggerAction = (type: BirdActionType) => {
    if (!selectedBird) return;
    setActionSignal({
        id: selectedBird.id,
        type,
        time: Date.now()
    });
  };

  const selectRandomBird = () => {
    // Request the world to select a random bird for us
    // This ensures we select a valid, living bird ID
    setWorldCommand({ type: 'SELECT_RANDOM' });
    setViewMode(ViewMode.FOLLOW);
  };

  const handleFollowSelected = () => {
    if (selectedBird) {
        setFollowedBirdId(selectedBird.id);
        setViewMode(ViewMode.FOLLOW);
    }
  };

  const handlePopulationChange = (type: 'ADD' | 'REMOVE') => {
    setWorldCommand({ type, count: 1 });
  };

  const triggerMigration = () => {
    // Generate random traits
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const randomScale = 0.3 + Math.random() * 1.2;
    const randomPitch = 200 + Math.random() * 1000;
    
    setWorldCommand({
        type: 'INTRODUCE_SPECIES',
        count: 5,
        params: {
            color: randomColor,
            scale: randomScale,
            pitch: randomPitch
        }
    });
  };

  const introduceCustomSpecies = () => {
      setWorldCommand({
          type: 'INTRODUCE_SPECIES',
          count: 5,
          params: {
              color: customSpecies.color,
              scale: customSpecies.scale,
              pitch: customSpecies.pitch
          }
      });
  };

  return (
    <div className="relative w-full h-full bg-slate-900 text-slate-100 overflow-hidden font-sans">
      
      <div className="absolute inset-0 z-0">
        <World 
            onBirdSelect={handleBirdSelect} 
            selectedBirdId={selectedBird?.id || null}
            followedBirdId={followedBirdId}
            isAudioEnabled={audioEnabled}
            actionSignal={actionSignal}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            simSettings={simSettings}
            evolutionSettings={evolutionSettings}
            isPaused={isPaused}
            onStatsUpdate={handleStatsUpdate}
            worldCommand={worldCommand}
        />
      </div>

      {!hasStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl max-w-md text-center">
            <div className="mb-6 flex justify-center">
               <div className="p-4 bg-green-500/20 rounded-full">
                 <BirdIcon size={48} className="text-green-400" />
               </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">Avian Polyphony</h1>
            <p className="text-gray-300 mb-8 leading-relaxed">
              A generative nature sandbox. 
              <br/>Listen to procedural bird calls and observe a living digital ecosystem.
            </p>
            <button 
              onClick={handleStart}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full transition-all transform hover:scale-105 flex items-center mx-auto gap-2 shadow-lg shadow-green-500/20"
            >
              <Volume2 size={20} />
              Enter Ecosystem
            </button>
          </div>
        </div>
      )}

      {hasStarted && (
        <>
            {/* Top Bar Controls */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
                <div className="pointer-events-auto bg-black/20 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs text-white/80 shadow-lg">
                    <h2 className="font-bold text-white mb-1 flex items-center gap-2">
                        <Music size={14} /> Audio Visualization
                    </h2>
                    <p>Expanding rings indicate active vocalization.</p>
                    <p>Patterns denote mating or territorial calls.</p>
                </div>

                <div className="pointer-events-auto flex flex-col items-end gap-2">
                  <div className="flex gap-2 bg-black/20 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-lg">
                   
                     <div className="flex gap-2 mr-2 border-r border-white/10 pr-2">
                          <button
                              onClick={selectRandomBird}
                              className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-full transition-colors flex items-center gap-2 px-3"
                              title="Next Random Bird"
                          >
                              <Shuffle size={16} />
                              <span className="text-xs font-bold">Next</span>
                          </button>
                     </div>

                     <button 
                       onClick={() => setViewMode(ViewMode.ORBIT)}
                       className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.ORBIT ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'}`}
                       title="Orbit View"
                     >
                       <Globe size={20} />
                     </button>

                     <button 
                       onClick={() => setViewMode(ViewMode.FPS)}
                       className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.FPS ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'}`}
                       title="First Person Walk"
                     >
                       <Eye size={20} />
                     </button>

                     <button 
                       onClick={() => {
                           if (!followedBirdId) selectRandomBird();
                           else setViewMode(ViewMode.FOLLOW);
                       }}
                       className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.FOLLOW ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'}`}
                       title="Follow Bird"
                     >
                       <Video size={20} />
                     </button>

                     <div className="w-px bg-white/10 mx-1"></div>

                     <button
                        onClick={() => setDashboardMode(!dashboardMode)}
                        className={`p-2 rounded-full transition-colors ${dashboardMode ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/10 text-white/60'}`}
                        title="Dashboard Mode (Show All UI)"
                     >
                        <LayoutDashboard size={20} />
                     </button>

                     <div className="w-px bg-white/10 mx-1"></div>

                     <button
                        disabled={dashboardMode}
                        onClick={() => { setShowSettings(!showSettings); setShowEvolution(false); setShowSpeciesPanel(false); }}
                        className={`p-2 rounded-full transition-colors ${showSettings && !dashboardMode ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'} ${dashboardMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title="Flight Settings"
                     >
                        <SlidersHorizontal size={20} />
                     </button>
                     
                     <button
                        disabled={dashboardMode}
                        onClick={() => { setShowEvolution(!showEvolution); setShowSettings(false); setShowSpeciesPanel(false); }}
                        className={`p-2 rounded-full transition-colors ${showEvolution && !dashboardMode ? 'bg-pink-500/20 text-pink-300' : 'hover:bg-white/10 text-white/60'} ${dashboardMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title="Evolution Controls"
                     >
                        <Dna size={20} />
                     </button>
                     
                     <button
                        disabled={dashboardMode}
                        onClick={() => { setShowSpeciesPanel(!showSpeciesPanel); setShowSettings(false); setShowEvolution(false); }}
                        className={`p-2 rounded-full transition-colors ${showSpeciesPanel && !dashboardMode ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10 text-white/60'} ${dashboardMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title="Introduce Species"
                     >
                        <TestTube size={20} />
                     </button>

                     <div className="w-px bg-white/10 mx-1"></div>

                     <button 
                        onClick={() => setIsPaused(!isPaused)}
                        className={`p-2 rounded-full transition-colors ${isPaused ? 'text-yellow-400 bg-white/10' : 'text-white hover:bg-white/10'}`}
                        title={isPaused ? "Resume Simulation" : "Pause Simulation"}
                     >
                        {isPaused ? <Play size={20} /> : <Pause size={20} />}
                     </button>

                     <button 
                       onClick={() => {
                           if(audioEnabled) audioEngine.stop();
                           else audioEngine.init();
                           setAudioEnabled(!audioEnabled);
                       }}
                       className={`p-2 rounded-full transition-colors ${audioEnabled ? 'text-white' : 'text-red-400'}`}
                       title="Toggle Audio"
                     >
                       {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                     </button>
                  </div>

                  {/* Dashboard Mode: Render all panels in a sidebar stack */}
                  {dashboardMode && (
                      <div className="absolute top-20 right-0 flex flex-col gap-4 pointer-events-auto z-30 pr-1 max-h-[calc(100vh-150px)] overflow-y-auto scrollbar-hide">
                          <FlightPanel settings={simSettings} setSettings={setSimSettings} />
                          <EvolutionPanel settings={evolutionSettings} setSettings={setEvolutionSettings} stats={stats} onPopChange={handlePopulationChange} />
                          <SpeciesPanel customSpecies={customSpecies} setCustomSpecies={setCustomSpecies} onMigrate={triggerMigration} onIntroduce={introduceCustomSpecies} />
                      </div>
                  )}
                  
                  {/* Classic Popover Mode */}
                  {!dashboardMode && showSettings && (
                    <div className="absolute top-16 right-0 pointer-events-auto z-30">
                        <FlightPanel settings={simSettings} setSettings={setSimSettings} />
                    </div>
                  )}
                  {!dashboardMode && showEvolution && (
                    <div className="absolute top-16 right-0 pointer-events-auto z-30">
                        <EvolutionPanel settings={evolutionSettings} setSettings={setEvolutionSettings} stats={stats} onPopChange={handlePopulationChange} />
                    </div>
                  )}
                  {!dashboardMode && showSpeciesPanel && (
                    <div className="absolute top-16 right-0 pointer-events-auto z-30">
                        <SpeciesPanel customSpecies={customSpecies} setCustomSpecies={setCustomSpecies} onMigrate={triggerMigration} onIntroduce={introduceCustomSpecies} />
                    </div>
                  )}
                </div>
            </div>
            
            {/* Stats Panel */}
            <div className="absolute bottom-8 left-4 pointer-events-none z-10 flex flex-col gap-4">
               {/* History Chart */}
               <PopulationChart data={history} />

               <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4 text-white/80 shadow-xl pointer-events-auto w-64">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                     <Activity size={14} className="text-green-400" /> Live Telemetry
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      <div className="flex flex-col">
                          <span className="text-gray-400 flex items-center gap-1"><Users size={10} /> Population</span>
                          <span className="text-base font-mono text-white">{stats.population}</span>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-gray-400 flex items-center gap-1"><Dna size={10} /> Max Gen</span>
                          <span className="text-base font-mono text-pink-300">v{stats.maxGeneration}</span>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-gray-400 flex items-center gap-1"><Mic size={10} /> Vocalizing</span>
                          <span className="text-base font-mono text-yellow-300">{stats.activeVoices}</span>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-gray-400 flex items-center gap-1"><Cookie size={10} /> Foraging</span>
                          <span className="text-base font-mono text-purple-300">{stats.foragingCount}</span>
                      </div>
                      
                      {/* Energy Bar */}
                      <div className="col-span-2 flex flex-col pt-1 border-t border-white/5 mt-1">
                          <span className="text-gray-400 flex items-center gap-1"><Zap size={10} /> Avg. Energy</span>
                          <div className="w-full bg-white/10 h-1.5 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="bg-yellow-500 h-full transition-all duration-500" 
                                style={{ width: `${Math.min(stats.avgEnergy, 100)}%` }}
                              />
                          </div>
                      </div>

                      <div className="col-span-2 flex flex-col pt-1 mt-1">
                          <span className="text-gray-400 flex items-center gap-1"><Mountain size={10} /> Avg. Altitude</span>
                          <div className="w-full bg-white/10 h-1.5 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="bg-green-500 h-full transition-all duration-500" 
                                style={{ width: `${Math.min((stats.averageHeight / 30) * 100, 100)}%` }}
                              />
                          </div>
                          <span className="text-[10px] font-mono text-right mt-0.5">{stats.averageHeight.toFixed(1)}m</span>
                      </div>
                  </div>
               </div>
            </div>
            
            {viewMode === ViewMode.FPS && (
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none bg-black/30 backdrop-blur text-white/60 px-4 py-2 rounded-full text-xs border border-white/10">
                     WASD to move • ESC to show cursor
                 </div>
            )}
            {viewMode === ViewMode.FOLLOW && (
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none bg-black/30 backdrop-blur text-green-400/80 px-4 py-2 rounded-full text-xs border border-green-500/20 font-mono flex items-center gap-2">
                     <Video size={12} />
                     TRACKING SUBJECT: {followedBirdId}
                 </div>
            )}

            <div className={`absolute top-4 right-4 bottom-4 w-80 transition-transform duration-500 ease-out z-40 pointer-events-none ${selectedBird ? 'translate-x-0' : 'translate-x-96'}`}>
                <div className="h-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
                    
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                        <h3 className="font-bold flex items-center gap-2 text-green-400">
                            <Info size={18} /> Specimen Analysis
                        </h3>
                        <button onClick={handleClosePanel} className="p-1 hover:bg-white/10 rounded-full">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        {!analysis && isAnalyzing && (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                <p className="text-sm text-gray-400 text-center">Querying Ecological Database...</p>
                            </div>
                        )}

                        {analysis && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Common Name</div>
                                    <div
                                        className="text-2xl font-serif text-white"
                                        dangerouslySetInnerHTML={{ __html: analysis.speciesName }}
                                    />
                                </div>

                                <div>
                                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Scientific Classification</div>
                                    <div
                                        className="text-sm italic text-green-300 font-mono"
                                        dangerouslySetInnerHTML={{ __html: analysis.scientificName }}
                                    />
                                </div>

                                <button 
                                    onClick={handleFollowSelected}
                                    className={`w-full py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                                        viewMode === ViewMode.FOLLOW && followedBirdId === selectedBird?.id
                                        ? 'bg-green-500/20 text-green-300 border border-green-500/50 cursor-default' 
                                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                    }`}
                                >
                                    {viewMode === ViewMode.FOLLOW && followedBirdId === selectedBird?.id ? (
                                        <>
                                            <Video size={16} className="animate-pulse" />
                                            Tracking Active
                                        </>
                                    ) : (
                                        <>
                                            <Video size={16} />
                                            Follow Specimen
                                        </>
                                    )}
                                </button>

                                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-yellow-400 text-sm font-bold">
                                        <Sparkles size={14} /> Observed Traits
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                                        <div>Gen: v{selectedBird?.generation}</div>
                                        <div>Age: {selectedBird?.age.toFixed(0)}s</div>
                                        <div>Energy: {selectedBird?.energy.toFixed(0)}%</div>
                                        <div>Pitch: {Math.round(selectedBird?.pitch || 0)}Hz</div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            Plumage: 
                                            <span 
                                                className="w-3 h-3 rounded-full inline-block" 
                                                style={{ backgroundColor: selectedBird?.color }} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Field Notes</div>
                                    <p
                                        className="text-sm text-gray-300 leading-relaxed border-l-2 border-green-500/30 pl-3"
                                        dangerouslySetInnerHTML={{ __html: analysis.description }}
                                    />
                                </div>

                                <div>
                                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Temperament</div>
                                    <div
                                        className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30"
                                        dangerouslySetInnerHTML={{ __html: analysis.temperament }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-white/10 bg-slate-800/50 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => triggerAction(BirdActionType.FEED)}
                            className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-green-500/20 hover:text-green-300 transition-all active:scale-95 border border-white/5 group"
                        >
                            <Cookie size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold">Offer Treats</span>
                        </button>
                        <button 
                            onClick={() => triggerAction(BirdActionType.DISTRACT)}
                            className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95 border border-white/5 group"
                        >
                            <Megaphone size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold">Distract</span>
                        </button>
                    </div>
                    
                    <div className="px-4 py-2 bg-slate-950 text-[10px] text-center text-gray-600">
                        Powered by Gemini AI & Tone.js
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
}

export default App;
