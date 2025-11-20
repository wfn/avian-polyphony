
import React, { useState, useCallback, useRef } from 'react';
import { World } from './components/World';
import { audioEngine } from './services/audioEngine';
import { analyzeBird } from './services/geminiService';
import { BirdData, BirdAnalysis, BirdActionType, ViewMode, SimSettings, SimulationStats, EvolutionSettings, WorldCommand } from './types';
import { Volume2, VolumeX, Info, X, Music, Bird as BirdIcon, Sparkles, Cookie, Megaphone, Eye, Globe, Video, Shuffle, SlidersHorizontal, Wind, Play, Pause, Activity, Users, Mic, Mountain, Dna, Zap, Timer, Sprout, Plus, Minus } from 'lucide-react';

function App() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedBird, setSelectedBird] = useState<BirdData | null>(null);
  const [followedBirdId, setFollowedBirdId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BirdAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ORBIT);
  const [showSettings, setShowSettings] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [simSettings, setSimSettings] = useState<SimSettings>({ 
      speed: 1, 
      agility: 1,
      renderDistance: 150 
  });
  const [evolutionSettings, setEvolutionSettings] = useState<EvolutionSettings>({ 
      enabled: false, 
      agingSpeed: 1.0, 
      mutationRate: 0.1,
      foodAbundance: 1.0
  });
  const [worldCommand, setWorldCommand] = useState<WorldCommand>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Stats State
  const [stats, setStats] = useState<SimulationStats>({ 
    population: 0, 
    flockCount: 0, 
    activeVoices: 0, 
    averageHeight: 0, 
    foragingCount: 0,
    maxGeneration: 0,
    avgEnergy: 0
  });
  
  const birdRegistry = useRef<Record<string, BirdAnalysis>>({});
  const [actionSignal, setActionSignal] = useState<{id: string, type: BirdActionType, time: number} | null>(null);

  const handleStart = async () => {
    await audioEngine.init();
    setAudioEnabled(true);
    setHasStarted(true);
  };

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
            onStatsUpdate={setStats}
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
                        onClick={() => { setShowSettings(!showSettings); setShowEvolution(false); }}
                        className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'}`}
                        title="Flight Settings"
                     >
                        <SlidersHorizontal size={20} />
                     </button>
                     
                     <button
                        onClick={() => { setShowEvolution(!showEvolution); setShowSettings(false); }}
                        className={`p-2 rounded-full transition-colors ${showEvolution ? 'bg-pink-500/20 text-pink-300' : 'hover:bg-white/10 text-white/60'}`}
                        title="Evolution Controls"
                     >
                        <Dna size={20} />
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

                  {/* Flight Settings Panel */}
                  {showSettings && (
                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white/80 shadow-xl w-64 animate-fade-in-down">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                            <Wind size={14} /> Flight Parameters
                        </h3>
                        
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Velocity</span>
                                <span className="text-green-400 font-mono">{simSettings.speed.toFixed(2)}x</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.05" 
                                max="3.0" 
                                step="0.05"
                                value={simSettings.speed}
                                onChange={(e) => setSimSettings(s => ({...s, speed: parseFloat(e.target.value)}))}
                                className="w-full accent-green-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Agility</span>
                                <span className="text-blue-400 font-mono">{simSettings.agility.toFixed(2)}x</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.05" 
                                max="3.0" 
                                step="0.05"
                                value={simSettings.agility}
                                onChange={(e) => setSimSettings(s => ({...s, agility: parseFloat(e.target.value)}))}
                                className="w-full accent-blue-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span>Visibility</span>
                                <span className="text-purple-400 font-mono">{simSettings.renderDistance.toFixed(0)}m</span>
                            </div>
                            <input 
                                type="range" 
                                min="50" 
                                max="500" 
                                step="10"
                                value={simSettings.renderDistance}
                                onChange={(e) => setSimSettings(s => ({...s, renderDistance: parseFloat(e.target.value)}))}
                                className="w-full accent-purple-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                  )}
                  
                  {/* Evolution Settings Panel */}
                  {showEvolution && (
                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-pink-500/20 text-white/80 shadow-xl w-72 animate-fade-in-down">
                        <div className="flex justify-between items-center mb-3">
                             <h3 className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                                <Dna size={14} className="text-pink-400"/> Evolution Logic
                            </h3>
                            <button 
                                onClick={() => setEvolutionSettings(s => ({...s, enabled: !s.enabled}))}
                                className={`w-10 h-5 rounded-full p-1 transition-colors ${evolutionSettings.enabled ? 'bg-pink-500' : 'bg-white/20'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${evolutionSettings.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Manual Population Control */}
                        <div className="mb-4 pb-4 border-b border-white/10">
                             <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Population Control</div>
                             <div className="flex items-center justify-between bg-white/5 rounded-lg p-1">
                                 <button 
                                    onClick={() => handlePopulationChange('REMOVE')}
                                    className="p-2 hover:bg-red-500/20 text-red-300 rounded-md transition-colors"
                                 >
                                     <Minus size={16} />
                                 </button>
                                 <span className="font-mono font-bold text-white">{stats.population}</span>
                                 <button 
                                     onClick={() => handlePopulationChange('ADD')}
                                     className="p-2 hover:bg-green-500/20 text-green-300 rounded-md transition-colors"
                                 >
                                     <Plus size={16} />
                                 </button>
                             </div>
                        </div>
                        
                        <div className={`space-y-4 transition-opacity ${evolutionSettings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="flex items-center gap-1"><Timer size={10}/> Life Speed (Aging)</span>
                                    <span className="text-pink-300 font-mono">{evolutionSettings.agingSpeed.toFixed(1)}x</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.1" 
                                    max="5.0" 
                                    step="0.1"
                                    value={evolutionSettings.agingSpeed}
                                    onChange={(e) => setEvolutionSettings(s => ({...s, agingSpeed: parseFloat(e.target.value)}))}
                                    className="w-full accent-pink-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="flex items-center gap-1"><Zap size={10}/> Mutation Rate</span>
                                    <span className="text-yellow-300 font-mono">{(evolutionSettings.mutationRate * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1.0" 
                                    step="0.05"
                                    value={evolutionSettings.mutationRate}
                                    onChange={(e) => setEvolutionSettings(s => ({...s, mutationRate: parseFloat(e.target.value)}))}
                                    className="w-full accent-yellow-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="flex items-center gap-1"><Sprout size={10}/> Food Abundance</span>
                                    <span className="text-green-300 font-mono">{evolutionSettings.foodAbundance.toFixed(1)}x</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.1" 
                                    max="3.0" 
                                    step="0.1"
                                    value={evolutionSettings.foodAbundance}
                                    onChange={(e) => setEvolutionSettings(s => ({...s, foodAbundance: parseFloat(e.target.value)}))}
                                    className="w-full accent-green-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                  )}
                </div>
            </div>
            
            {/* Stats Panel */}
            <div className="absolute bottom-8 left-4 pointer-events-none z-10">
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

            <div className={`absolute top-4 right-4 bottom-4 w-80 transition-transform duration-500 ease-out z-20 pointer-events-none ${selectedBird ? 'translate-x-0' : 'translate-x-96'}`}>
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
                                    <div className="text-2xl font-serif text-white">{analysis.speciesName}</div>
                                </div>

                                <div>
                                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Scientific Classification</div>
                                    <div className="text-sm italic text-green-300 font-mono">{analysis.scientificName}</div>
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
                                    <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-green-500/30 pl-3">
                                        {analysis.description}
                                    </p>
                                </div>

                                <div>
                                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Temperament</div>
                                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                                        {analysis.temperament}
                                    </div>
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