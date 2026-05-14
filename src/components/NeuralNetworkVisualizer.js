import React, { useState, useEffect, useCallback, useMemo } from 'react';

const NeuralNetworkVisualizer = () => {
    const [layers, setLayers] = useState([4, 6, 6, 2]);
    const [animating, setAnimating] = useState(true);
    const [pulseIndex, setPulseIndex] = useState(0);

    // Generate neurons with positions
    const networkData = useMemo(() => {
        const padding = 60;
        const width = 800;
        const height = 500;
        const layerGap = (width - 2 * padding) / (layers.length - 1);

        const neurons = layers.map((count, lIdx) => {
            const x = padding + lIdx * layerGap;
            const neuronGap = (height - 2 * padding) / (count - 1 || 1);
            const startY = count === 1 ? height / 2 : padding;

            return Array.from({ length: count }, (_, nIdx) => ({
                id: `l${lIdx}-n${nIdx}`,
                x,
                y: startY + nIdx * neuronGap,
                layer: lIdx
            }));
        });

        const connections = [];
        for (let i = 0; i < neurons.length - 1; i++) {
            neurons[i].forEach(from => {
                neurons[i + 1].forEach(to => {
                    connections.push({
                        id: `c-${from.id}-${to.id}`,
                        from,
                        to,
                        weight: Math.random()
                    });
                });
            });
        }

        return { neurons: neurons.flat(), connections, width, height };
    }, [layers]);

    useEffect(() => {
        if (!animating) return;
        const interval = setInterval(() => {
            setPulseIndex(prev => (prev + 1) % layers.length);
        }, 1000);
        return () => clearInterval(interval);
    }, [animating, layers.length]);

    const addLayer = () => {
        if (layers.length >= 6) return;
        const newLayers = [...layers];
        newLayers.splice(layers.length - 1, 0, 5);
        setLayers(newLayers);
    };

    const removeLayer = (idx) => {
        if (layers.length <= 2) return;
        const newLayers = layers.filter((_, i) => i !== idx);
        setLayers(newLayers);
    };

    const updateNeuronCount = (idx, delta) => {
        const newLayers = [...layers];
        newLayers[idx] = Math.max(1, Math.min(8, newLayers[idx] + delta));
        setLayers(newLayers);
    };

    return (
        <div className="flex justify-center items-center min-h-[800px] p-8 bg-[#050505] rounded-[3rem] m-5 shadow-2xl relative overflow-hidden group font-sans border border-white/5">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-7xl relative z-10">
                
                {/* Sidebar Controls */}
                <div className="lg:col-span-4 bg-white/[0.02] backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8 max-h-[700px] overflow-y-auto custom-scrollbar">
                    <header>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-2">Neural Lab</h2>
                        <p className="text-gray-500 font-medium text-sm">Visualize and architect deep learning models</p>
                    </header>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Network Architecture</span>
                            <button 
                                onClick={addLayer}
                                className="text-[10px] px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all font-bold border border-blue-500/30"
                            >
                                + ADD HIDDEN LAYER
                            </button>
                        </div>

                        <div className="space-y-3">
                            {layers.map((count, idx) => (
                                <div key={idx} className="p-4 bg-white/[0.04] rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/[0.06] transition-all">
                                    <div>
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter block mb-1">
                                            {idx === 0 ? 'Input Layer' : idx === layers.length - 1 ? 'Output Layer' : `Hidden Layer ${idx}`}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => updateNeuronCount(idx, -1)}
                                                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                -
                                            </button>
                                            <span className="text-xl font-bold text-white min-w-[1.5rem] text-center">{count}</span>
                                            <button 
                                                onClick={() => updateNeuronCount(idx, 1)}
                                                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    {idx !== 0 && idx !== layers.length - 1 && (
                                        <button 
                                            onClick={() => removeLayer(idx)}
                                            className="text-white/20 hover:text-red-400 transition-colors p-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={() => setAnimating(!animating)}
                            className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 border ${
                                animating 
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' 
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                        >
                            {animating ? (
                                <>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    ACTIVE PROPAGATION
                                </>
                            ) : 'START SIMULATION'}
                        </button>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl border border-white/5 space-y-4">
                        <h4 className="text-white/60 font-bold text-xs uppercase tracking-widest">Network Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-white/30 text-[10px] block uppercase font-black">Params</span>
                                <span className="text-xl font-bold text-white">{networkData.connections.length.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-white/30 text-[10px] block uppercase font-black">Accuracy</span>
                                <span className="text-xl font-bold text-emerald-400">98.4%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Visualization Canvas */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-full">
                    <div className="flex-1 bg-white/[0.02] rounded-[3rem] border border-white/5 relative overflow-hidden group/canvas p-10 min-h-[600px] flex items-center justify-center shadow-inner">
                        <svg 
                            viewBox={`0 0 ${networkData.width} ${networkData.height}`} 
                            className="w-full h-full drop-shadow-2xl overflow-visible"
                        >
                            <defs>
                                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Connections */}
                            {networkData.connections.map(conn => (
                                <path
                                    key={conn.id}
                                    d={`M ${conn.from.x} ${conn.from.y} C ${(conn.from.x + conn.to.x)/2} ${conn.from.y}, ${(conn.from.x + conn.to.x)/2} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`}
                                    fill="none"
                                    stroke="url(#lineGrad)"
                                    strokeWidth={conn.weight * 2 + 0.5}
                                    className="transition-all duration-700"
                                    opacity={animating && pulseIndex === conn.from.layer ? 1 : 0.2}
                                />
                            ))}

                            {/* Data Pulses */}
                            {animating && networkData.connections.filter(c => c.from.layer === pulseIndex).map((conn, i) => (
                                <circle key={`pulse-${conn.id}`} r="2" fill="#fff">
                                    <animateMotion 
                                        dur="1s" 
                                        repeatCount="indefinite" 
                                        path={`M ${conn.from.x} ${conn.from.y} C ${(conn.from.x + conn.to.x)/2} ${conn.from.y}, ${(conn.from.x + conn.to.x)/2} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`} 
                                    />
                                    <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
                                </circle>
                            ))}

                            {/* Neurons */}
                            {networkData.neurons.map(n => (
                                <g key={n.id} className="transition-all duration-500">
                                    <circle
                                        cx={n.x}
                                        cy={n.y}
                                        r="12"
                                        fill="#0a0a0a"
                                        stroke={pulseIndex === n.layer ? "#818cf8" : "#333"}
                                        strokeWidth="2"
                                        filter={pulseIndex === n.layer ? "url(#glow)" : ""}
                                        className="transition-all duration-300"
                                    />
                                    {pulseIndex === n.layer && (
                                        <circle
                                            cx={n.x}
                                            cy={n.y}
                                            r="16"
                                            fill="transparent"
                                            stroke="#818cf8"
                                            strokeWidth="1"
                                            opacity="0.5"
                                        >
                                            <animate attributeName="r" from="12" to="24" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" from="0.5" to="0" dur="1s" repeatCount="indefinite" />
                                        </circle>
                                    )}
                                    <circle
                                        cx={n.x}
                                        cy={n.y}
                                        r="4"
                                        fill={pulseIndex === n.layer ? "#fff" : "#444"}
                                        className="transition-all duration-300"
                                    />
                                </g>
                            ))}
                        </svg>

                        <div className="absolute top-8 left-8 flex items-center gap-4">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest block">Model</span>
                                <span className="text-white font-bold">ResNet-Flow</span>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest block">Epoch</span>
                                <span className="text-white font-mono">1,492</span>
                            </div>
                        </div>

                        <div className="absolute bottom-8 right-8 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Real-time Inference</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};

export default NeuralNetworkVisualizer;
