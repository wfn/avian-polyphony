
import React, { useMemo, useState, useRef } from 'react';
import { HistoryPoint } from '../types';
import { Maximize2, Minimize2, TrendingUp } from 'lucide-react';

interface PopulationChartProps {
  data: HistoryPoint[];
}

export const PopulationChart: React.FC<PopulationChartProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { paths, maxVal, minVal } = useMemo(() => {
    if (data.length < 2) return { paths: {}, maxVal: 10, minVal: 0 };

    // Calculate min/max for Y-axis scaling to make chart look dynamic
    const allValues = data.flatMap(d => [d.population, d.voices, d.foraging]);
    const maxData = Math.max(...allValues, 5); // Min cap of 5
    const minData = Math.min(...allValues);
    
    // Add 10% padding
    const range = maxData - minData || 1;
    const maxVal = maxData + range * 0.1;
    const minVal = Math.max(0, minData - range * 0.1);
    
    const getCoord = (val: number, i: number) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - minVal) / (maxVal - minVal)) * 100;
      return `${x},${y}`;
    };

    const createPath = (key: keyof HistoryPoint) => {
      return data.map((d, i) => getCoord(d[key] as number, i)).join(' ');
    };

    return {
      paths: {
        population: createPath('population'),
        voices: createPath('voices'),
        foraging: createPath('foraging'),
      },
      maxVal,
      minVal
    };
  }, [data]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || data.length < 2) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(percent * (data.length - 1));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Show latest data if not hovering
  const activeData = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  if (!data.length) return null;

  return (
    <div 
        className={`bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-xl transition-all duration-300 overflow-hidden flex flex-col pointer-events-auto ${isExpanded ? 'w-96 h-64' : 'w-56 h-32'}`}
    >
        {/* Header */}
        <div className="flex justify-between items-center p-2 border-b border-white/5 bg-white/5">
             <h3 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={12} className="text-blue-400"/> 
                {isExpanded ? 'Population Dynamics' : 'Dynamics'}
             </h3>
             <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-white/10 rounded-full text-white/60 transition-colors"
             >
                {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
             </button>
        </div>

        {/* Chart Area */}
        <div 
            className="relative flex-1 w-full overflow-hidden cursor-crosshair bg-gradient-to-b from-white/5 to-transparent"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {data.length > 1 && (
            <svg 
                className="w-full h-full" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
            >
                {/* Grid Lines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />

                {/* Areas/Lines */}
                {paths.population && (
                    <>
                        <path d={`M 0,100 ${paths.population} V 100 Z`} fill="url(#gradPop)" />
                        <polyline points={paths.population} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                    </>
                )}
                
                {paths.foraging && (
                    <polyline points={paths.foraging} fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3,1" opacity="0.8" />
                )}

                {paths.voices && (
                    <>
                        <path d={`M 0,100 ${paths.voices} V 100 Z`} fill="url(#gradVoice)" />
                        <polyline points={paths.voices} fill="none" stroke="#facc15" strokeWidth="1.5" />
                    </>
                )}

                <defs>
                    <linearGradient id="gradPop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="gradVoice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#facc15" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#facc15" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Cursor Line */}
                {hoverIndex !== null && (
                    <line 
                        x1={(hoverIndex / (data.length - 1)) * 100} 
                        y1="0" 
                        x2={(hoverIndex / (data.length - 1)) * 100} 
                        y2="100" 
                        stroke="white" 
                        strokeOpacity="0.5" 
                        strokeWidth="0.5" 
                        strokeDasharray="2,2"
                    />
                )}
            </svg>
            )}
        </div>
        
        {/* Legend / Tooltip Footer */}
        <div className="p-2 bg-black/20 text-[10px] font-mono border-t border-white/10 flex justify-between items-center">
            <div className="flex gap-3">
                 <div className="flex items-center gap-1 text-blue-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Pop: {activeData?.population || 0}
                 </div>
                 <div className="flex items-center gap-1 text-yellow-300">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Voc: {activeData?.voices || 0}
                 </div>
                 {isExpanded && (
                    <>
                        <div className="flex items-center gap-1 text-purple-300">
                            <div className="w-2 h-2 rounded-full bg-purple-500 opacity-50"></div>
                            Forage: {activeData?.foraging || 0}
                        </div>
                         <div className="flex items-center gap-1 text-green-300">
                            <span className="text-[8px]">⚡</span>
                            {activeData?.avgEnergy.toFixed(0)}%
                        </div>
                    </>
                 )}
            </div>
            {hoverIndex !== null && (
                 <div className="text-white/40 text-[9px]">
                    T-{data.length - hoverIndex}
                 </div>
            )}
        </div>
    </div>
  );
};
