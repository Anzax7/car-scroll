'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { 
  RotateCcw, 
  MousePointerClick
} from 'lucide-react';

// Reusable Counter Component that counts up in real-time based on scroll progress
interface DynamicCounterProps {
  progress: any; // MotionValue
  range: [number, number]; // [startScroll, endScroll]
  targetValue: number;
}

const DynamicCounter = ({ progress, range, targetValue }: DynamicCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const countMotion = useTransform(progress, range, [0, targetValue]);

  useEffect(() => {
    return countMotion.on('change', (latest) => {
      // Clamp value between 0 and target value
      const clamped = Math.min(targetValue, Math.max(0, Math.round(latest)));
      setDisplayValue(clamped);
    });
  }, [countMotion, targetValue]);

  return <span className="tabular-nums">{displayValue}</span>;
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [manualProgress, setManualProgress] = useState<number | null>(null);

  // 1. Hooking up Next.js scroll listener
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Adding momentum smoothing to scroll values
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 90,
    restDelta: 0.001
  });

  const activeProgress = manualProgress !== null ? manualProgress : 0;

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setManualProgress(latest);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // 2. Car translation from left to right
  // Progress 0: car nose just showing on the left edge (exactly like the screenshot, but mirrored!)
  // Progress 1: car driven fully offscreen right
  const carX = useTransform(smoothProgress, [0, 1], ["-250px", "100vw"]);
  
  // Wheel spinning animation mapped to progress (clockwise for left-to-right travel)
  const wheelRotation = useTransform(smoothProgress, [0, 1], [0, 1800]); 

  // 3. Card Reveals: As the car drives past them from left to right, the cards pop up in sequence!
  // Left cards (Lime 58%, Blue 23%) get passed first, then Right cards (Charcoal 27%, Orange 40%)
  
  // Lime Card 58% (Left side, top) - triggers early, around progress 0.12 to 0.40
  const leftTopScale = useTransform(smoothProgress, [0, 0.15, 0.35], [0.8, 1.05, 1]);
  const leftTopOpacity = useTransform(smoothProgress, [0, 0.12, 0.28], [0, 0.7, 1]);
  const leftTopY = useTransform(smoothProgress, [0, 0.12, 0.28], [30, -5, 0]);

  // Blue Card 23% (Left side, bottom) - triggers early, around progress 0.18 to 0.45
  const leftBottomScale = useTransform(smoothProgress, [0, 0.22, 0.40], [0.8, 1.05, 1]);
  const leftBottomOpacity = useTransform(smoothProgress, [0, 0.18, 0.32], [0, 0.7, 1]);
  const leftBottomY = useTransform(smoothProgress, [0, 0.18, 0.32], [30, -5, 0]);

  // Charcoal Card 27% (Right side, top) - triggers late, around progress 0.45 to 0.72
  const rightTopScale = useTransform(smoothProgress, [0, 0.48, 0.65], [0.8, 1.05, 1]);
  const rightTopOpacity = useTransform(smoothProgress, [0, 0.45, 0.58], [0, 0.7, 1]);
  const rightTopY = useTransform(smoothProgress, [0, 0.45, 0.58], [30, -5, 0]);

  // Orange Card 40% (Right side, bottom) - triggers late, around progress 0.52 to 0.78
  const rightBottomScale = useTransform(smoothProgress, [0, 0.55, 0.72], [0.8, 1.05, 1]);
  const rightBottomOpacity = useTransform(smoothProgress, [0, 0.52, 0.65], [0, 0.7, 1]);
  const rightBottomY = useTransform(smoothProgress, [0, 0.52, 0.65], [30, -5, 0]);

  // Text letters subtle translation as car rolls over them
  const greenTextX = useTransform(smoothProgress, [0, 1], ["0px", "80px"]);

  // Reset helper
  const handleReset = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setManualProgress(0);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-[300vh] w-full bg-[#D4D4D4] text-[#1C1C1C] overflow-x-hidden font-sans select-none"
    >
      {/* ----------------- FIXED MAIN VIEWPORT CONTAINER ----------------- */}
      <div className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col justify-between z-10 p-4 md:p-8">
        
        {/* TOP CONTROLS & META BAR */}
        <div className="w-full flex justify-between items-center z-30 select-none max-w-7xl mx-auto">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono tracking-[0.3em] text-[#555] uppercase font-bold">
              SCROLL-DRIVEN SIMULATION
            </span>
            <span className="text-xl font-black tracking-tight font-mono text-black">
              ZENITH GT <span className="text-[10px] bg-black text-[#D4D4D4] px-1.5 py-0.5 ml-1 rounded">V2</span>
            </span>
          </div>

          {/* Center interactive helper */}
          <div className="hidden lg:flex items-center gap-3 bg-white/40 backdrop-blur px-4 py-2 border border-white/40 shadow-sm rounded-lg text-xs text-neutral-800 font-medium">
            <MousePointerClick className="w-4 h-4 text-black animate-pulse" />
            <span>Scroll down or use the right scrollbar to drive the car from Left to Right</span>
          </div>

          {/* Interactive Reset Action */}
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* ----------------- THE INTERACTIVE SCENE ----------------- */}
        <div className="relative w-full flex-grow flex flex-col justify-center items-center max-w-7xl mx-auto">
          
          {/* ================= ABOVE THE BANNER (TOP CARDS) ================= */}
          <div className="absolute top-[8%] lg:top-[12%] w-full flex justify-between px-6 sm:px-12 lg:px-24 select-none z-30">
            {/* LIME CARD (58% - LEFT TOP - Triggers early) */}
            <motion.div 
              style={{ 
                scale: leftTopScale, 
                opacity: leftTopOpacity, 
                y: leftTopY 
              }}
              className="w-[180px] sm:w-[280px] lg:w-[320px] bg-[#D9F99D] p-5 sm:p-7 md:p-8 border border-black/[0.04] shadow-md hover:shadow-lg transition-shadow duration-300 rounded-none flex flex-col justify-between aspect-[1.9]"
            >
              <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-black tabular-nums">
                <DynamicCounter progress={smoothProgress} range={[0.12, 0.35]} targetValue={58} />%
              </span>
              <span className="text-xs sm:text-sm lg:text-base font-bold tracking-tight text-black/80 mt-2 leading-snug">
                Increase in pick up point use
              </span>
            </motion.div>

            {/* CHARCOAL CARD (27% - RIGHT TOP - Triggers late) */}
            <motion.div 
              style={{ 
                scale: rightTopScale, 
                opacity: rightTopOpacity, 
                y: rightTopY 
              }}
              className="w-[180px] sm:w-[280px] lg:w-[320px] bg-[#27272A] text-white p-5 sm:p-7 md:p-8 border border-white/[0.04] shadow-md hover:shadow-lg transition-shadow duration-300 rounded-none flex flex-col justify-between aspect-[1.9]"
            >
              <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-white tabular-nums">
                <DynamicCounter progress={smoothProgress} range={[0.45, 0.65]} targetValue={27} />%
              </span>
              <span className="text-xs sm:text-sm lg:text-base font-bold tracking-tight text-white/85 mt-2 leading-snug">
                Increase in pick up point use
              </span>
            </motion.div>
          </div>

          {/* ================= CENTRAL GREEN STRIP & TEXT ================= */}
          <div className="relative w-[100vw] h-[16vh] sm:h-[18vh] lg:h-[22vh] bg-[#36D399] flex items-center overflow-hidden border-t-2 border-b-2 border-black/5 z-20">
            {/* Infinite Horizontal text */}
            <motion.div 
              style={{ x: greenTextX }}
              className="w-full flex justify-center items-center whitespace-nowrap select-none"
            >
              <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] font-black tracking-[0.12em] uppercase text-black font-mono leading-none px-12">
                WELCOME ITZFIZZ
              </h1>
            </motion.div>

            {/* ================= THE ORANGE SUPERCAR (TOP-DOWN VIEW) ================= */}
            {/* Positioned on top of the text and translates horizontally from LEFT to RIGHT */}
            <motion.div 
              style={{ x: carX }}
              className="absolute inset-y-0 w-[240px] sm:w-[320px] lg:w-[380px] flex items-center select-none z-30 pointer-events-none drop-shadow-[0_25px_15px_rgba(0,0,0,0.35)]"
            >
              {/* Added scale-x-[-1] to flip the car to face RIGHTWARD */}
              <div className="relative w-full aspect-[2.1/1] scale-x-[-1]">
                <svg viewBox="0 0 210 100" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Glowing dynamic headlights beam cast leftwards relative to SVG space (which becomes rightwards under scaleX(-1)!) */}
                  <path 
                    d="M 12,50 L -120,-30 L -120,130 Z" 
                    fill="url(#carHeadlightBeam)" 
                    opacity="0.25" 
                  />

                  {/* 4 ROTATING WHEELS (Spins forward/clockwise) */}
                  {/* Front Left Wheel */}
                  <motion.g style={{ originX: '45px', originY: '11px', rotate: wheelRotation }}>
                    <rect x="33" y="4" width="24" height="14" rx="3.5" fill="#09090b" stroke="#222" strokeWidth="0.5" />
                    <line x1="33" y1="11" x2="57" y2="11" stroke="#444" strokeWidth="1" />
                    <line x1="45" y1="4" x2="45" y2="18" stroke="#444" strokeWidth="1" />
                  </motion.g>

                  {/* Front Right Wheel */}
                  <motion.g style={{ originX: '45px', originY: '89px', rotate: wheelRotation }}>
                    <rect x="33" y="82" width="24" height="14" rx="3.5" fill="#09090b" stroke="#222" strokeWidth="0.5" />
                    <line x1="33" y1="89" x2="57" y2="89" stroke="#444" strokeWidth="1" />
                    <line x1="45" y1="82" x2="45" y2="96" stroke="#444" strokeWidth="1" />
                  </motion.g>

                  {/* Rear Left Wheel */}
                  <motion.g style={{ originX: '155px', originY: '10px', rotate: wheelRotation }}>
                    <rect x="141" y="2" width="28" height="16" rx="4" fill="#09090b" stroke="#222" strokeWidth="0.5" />
                    <line x1="141" y1="10" x2="169" y2="10" stroke="#444" strokeWidth="1" />
                    <line x1="155" y1="2" x2="155" y2="18" stroke="#444" strokeWidth="1" />
                  </motion.g>

                  {/* Rear Right Wheel */}
                  <motion.g style={{ originX: '155px', originY: '90px', rotate: wheelRotation }}>
                    <rect x="141" y="82" width="28" height="16" rx="4" fill="#09090b" stroke="#222" strokeWidth="0.5" />
                    <line x1="141" y1="90" x2="169" y2="90" stroke="#444" strokeWidth="1" />
                    <line x1="155" y1="82" x2="155" y2="98" stroke="#444" strokeWidth="1" />
                  </motion.g>

                  {/* CHASSIS SILHOUETTE (Orange McLaren curves) */}
                  <path 
                    d="M 12,50 
                       C 14,35 24,24 45,21 
                       C 68,18 128,15 168,19
                       C 188,21 198,31 198,50
                       C 198,69 188,79 168,81
                       C 128,85 68,82 45,79
                       C 24,76 14,65 12,50 Z" 
                    fill="url(#carPaintGrad)" 
                    stroke="#C2410C" 
                    strokeWidth="1.5" 
                  />

                  {/* Aerodynamic Windshield Cabin Glass */}
                  <path 
                    d="M 52,50 
                       C 52,40 58,32 72,32 
                       C 88,32 112,35 116,50 
                       C 112,65 88,68 72,68 
                       C 58,68 52,60 52,50 Z" 
                    fill="url(#glassGrad)" 
                    stroke="rgba(255,255,255,0.15)" 
                    strokeWidth="0.75" 
                  />
                  
                  {/* Gloss windshield reflection highlight */}
                  <path 
                    d="M 58,40 C 65,34 78,34 84,36" 
                    stroke="rgba(255,255,255,0.25)" 
                    strokeWidth="1" 
                    strokeLinecap="round" 
                  />

                  {/* McLaren signature teardrop dark headlight sockets */}
                  <path d="M 22,34 C 25,34 29,38 27,43 C 25,45 20,43 20,38 Z" fill="#09090b" />
                  <path d="M 22,66 C 25,66 29,62 27,57 C 25,55 20,57 20,62 Z" fill="#09090b" />

                  {/* Glowing headlamp emitters */}
                  <circle cx="23" cy="37" r="1.5" fill="#22d3ee" className="animate-pulse" />
                  <circle cx="23" cy="63" r="1.5" fill="#22d3ee" className="animate-pulse" />

                  {/* Front Splitter Lip */}
                  <path d="M 12,42 C 11,45 11,55 12,58 L 7,50 Z" fill="#18181b" />

                  {/* Dual Front Hood Intakes */}
                  <path d="M 36,41 C 41,41 45,43 45,45" stroke="#18181b" strokeWidth="1" strokeLinecap="round" />
                  <path d="M 36,59 C 41,59 45,57 45,55" stroke="#18181b" strokeWidth="1" strokeLinecap="round" />

                  {/* Rear Engine Cover vents */}
                  <line x1="130" y1="42" x2="155" y2="42" stroke="#18181b" strokeWidth="1" />
                  <line x1="130" y1="50" x2="155" y2="50" stroke="#18181b" strokeWidth="1" />
                  <line x1="130" y1="58" x2="155" y2="58" stroke="#18181b" strokeWidth="1" />

                  {/* Spoiler Wing */}
                  <rect x="175" y="16" width="6" height="68" rx="1.5" fill="#18181b" stroke="#EA580C" strokeWidth="0.5" />
                  <path d="M 175,28 L 181,28 M 175,72 L 181,72" stroke="#18181b" strokeWidth="1" />

                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="carPaintGrad" x1="0%" y1="20%" x2="0%" y2="80%">
                      <stop offset="0%" stopColor="#FB923C" />
                      <stop offset="25%" stopColor="#F97316" />
                      <stop offset="50%" stopColor="#EA580C" />
                      <stop offset="75%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#FB923C" />
                    </linearGradient>

                    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#18181b" />
                      <stop offset="50%" stopColor="#09090b" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>

                    <linearGradient id="carHeadlightBeam" x1="10%" y1="50%" x2="0%" y2="50%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </div>

          {/* ================= BELOW THE BANNER (BOTTOM CARDS) ================= */}
          <div className="absolute bottom-[8%] lg:bottom-[12%] w-full flex justify-between px-6 sm:px-12 lg:px-24 select-none z-30">
            {/* SKY BLUE CARD (23% - LEFT BOTTOM - Triggers early) */}
            <motion.div 
              style={{ 
                scale: leftBottomScale, 
                opacity: leftBottomOpacity, 
                y: leftBottomY 
              }}
              className="w-[180px] sm:w-[280px] lg:w-[320px] bg-[#38BDF8] p-5 sm:p-7 md:p-8 border border-black/[0.04] shadow-md hover:shadow-lg transition-shadow duration-300 rounded-none flex flex-col justify-between aspect-[1.9]"
            >
              <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-black tabular-nums">
                <DynamicCounter progress={smoothProgress} range={[0.18, 0.40]} targetValue={23} />%
              </span>
              <span className="text-xs sm:text-sm lg:text-base font-bold tracking-tight text-black/80 mt-2 leading-snug">
                Decreased in customer phone calls
              </span>
            </motion.div>

            {/* ORANGE CARD (40% - RIGHT BOTTOM - Triggers late) */}
            <motion.div 
              style={{ 
                scale: rightBottomScale, 
                opacity: rightBottomOpacity, 
                y: rightBottomY 
              }}
              className="w-[180px] sm:w-[280px] lg:w-[320px] bg-[#FB923C] p-5 sm:p-7 md:p-8 border border-black/[0.04] shadow-md hover:shadow-lg transition-shadow duration-300 rounded-none flex flex-col justify-between aspect-[1.9]"
            >
              <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-black tabular-nums">
                <DynamicCounter progress={smoothProgress} range={[0.52, 0.72]} targetValue={40} />%
              </span>
              <span className="text-xs sm:text-sm lg:text-base font-bold tracking-tight text-black/80 mt-2 leading-snug">
                Decreased in customer phone calls
              </span>
            </motion.div>
          </div>

        </div>

        {/* BOTTOM METADATA CONTROLS */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-black/10 pt-4 z-30 max-w-7xl mx-auto">
          {/* Scroll progress slider indicator */}
          <div className="flex items-center gap-4 w-full sm:w-1/2">
            <span className="text-[10px] font-mono tracking-widest text-[#555] uppercase font-bold shrink-0">
              MANUAL TIMELINE DRAG
            </span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.001"
              value={activeProgress} 
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setManualProgress(val);
                if (containerRef.current) {
                  const scrollHeight = containerRef.current.scrollHeight - window.innerHeight;
                  window.scrollTo({ top: scrollHeight * val, behavior: 'auto' });
                }
              }}
              className="w-full h-1 bg-black/15 rounded-lg appearance-none cursor-ew-resize accent-black focus:outline-none"
            />
            <span className="text-[10px] font-mono font-bold text-black min-w-[40px] text-right">
              {Math.round(activeProgress * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-5 text-[10px] font-mono tracking-widest text-black/60 font-bold uppercase">
            <span>ITZFIZZ AGENCYSTUDIO</span>
            <span>·</span>
            <span>PROVED BY REAL-TIME VECTORS</span>
          </div>
        </div>

      </div>

      {/* ----------------- HIDDEN STRUCTURAL SCROLL BUFFER ----------------- */}
      <div className="h-full w-full pointer-events-none select-none" />
    </div>
  );
}
