import React, { useState, useEffect, useRef } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import Navbar from './components/Navbar';
import BottomHUD from './components/BottomHUD';
import ProductDetailCard from './components/ProductDetailCard';
import { PIECES } from './data/pieces';

export default function App() {
  // Center piece is default Piece 03 (Index 2)
  const [activePieceIndex, setActivePieceIndex] = useState(2);
  const [isExploring, setIsExploring] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [viewMode, setViewMode] = useState('hanger'); // 'hanger' | 'model'
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bagCount, setBagCount] = useState(0);

  const activePiece = PIECES[activePieceIndex];

  // Reset color selection and viewMode when switching pieces
  useEffect(() => {
    setActiveColorIndex(activePiece.defaultColorIndex || 0);
    setViewMode('hanger');
    playTone(320, 0.08);
  }, [activePieceIndex]);

  // Subtle Web Audio API feedback for luxury tactile interactions
  const audioCtxRef = useRef(null);
  const playTone = (freq = 440, duration = 0.08, type = 'sine') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const handlePrevPiece = () => {
    if (activePieceIndex > 0) {
      setActivePieceIndex(activePieceIndex - 1);
    }
  };

  const handleNextPiece = () => {
    if (activePieceIndex < PIECES.length - 1) {
      setActivePieceIndex(activePieceIndex + 1);
    }
  };

  const handleExplore = () => {
    setIsExploring(true);
    playTone(520, 0.12);
  };

  const handleCloseExplore = () => {
    setIsExploring(false);
    playTone(280, 0.1);
  };

  const handleSelectColor = (index) => {
    setActiveColorIndex(index);
    playTone(660, 0.15, 'triangle');
  };

  const handleAddToBag = () => {
    setBagCount((prev) => prev + 1);
    playTone(880, 0.2, 'triangle');
  };

  const handleToggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    playTone(400, 0.1);
  };

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-700 ${
        isDarkTheme ? 'bg-[#072214] text-[#F5EBD7]' : 'bg-[#F5EBD7] text-[#046438]'
      }`}
    >
      {/* 1. Full-screen Interactive 3D WebGL Scene */}
      <ThreeCanvas
        activePieceIndex={activePieceIndex}
        setActivePieceIndex={setActivePieceIndex}
        isExploring={isExploring}
        activeColorIndex={activeColorIndex}
        viewMode={viewMode}
        isDarkTheme={isDarkTheme}
        onPieceClick={() => {
          if (!isExploring) handleExplore();
        }}
      />

      {/* 2. Top Navigation Bar HUD Overlay */}
      <Navbar
        isDarkTheme={isDarkTheme}
        setIsDarkTheme={handleToggleTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={(enabled) => {
          setSoundEnabled(enabled);
          if (enabled) playTone(440, 0.1);
        }}
        bagCount={bagCount}
        activePiece={activePiece}
      />

      {/* 3. Bottom Gallery HUD Overlay (Overview Mode) */}
      <BottomHUD
        activePiece={activePiece}
        activePieceIndex={activePieceIndex}
        onPrevPiece={handlePrevPiece}
        onNextPiece={handleNextPiece}
        onSelectPiece={setActivePieceIndex}
        onExplore={handleExplore}
        isExploring={isExploring}
        isDarkTheme={isDarkTheme}
      />

      {/* 4. Luxury Slide-In Product Detail Card (Explore Mode) */}
      {isExploring && (
        <>
          {/* Mobile interactive rotation hint pill */}
          <div className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className={`text-[9px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border backdrop-blur-md shadow-sm ${
              isDarkTheme 
                ? 'bg-black/50 border-white/20 text-[#F5EBD7]/90' 
                : 'bg-[#F5EBD7]/85 border-[#046438]/20 text-[#046438]'
            }`}>
              ↺ SWIPE TO ROTATE 360°
            </span>
          </div>

          <ProductDetailCard
            piece={activePiece}
            activeColorIndex={activeColorIndex}
            onSelectColor={handleSelectColor}
            viewMode={viewMode}
            setViewMode={(mode) => {
              setViewMode(mode);
              playTone(480, 0.08);
            }}
            onClose={handleCloseExplore}
            onAddToBag={handleAddToBag}
            isDarkTheme={isDarkTheme}
          />
        </>
      )}
    </div>
  );
}

