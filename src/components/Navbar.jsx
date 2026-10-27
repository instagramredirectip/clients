import React from 'react';
import { Sun, Moon, Volume2, VolumeX, ShoppingBag } from 'lucide-react';

export default function Navbar({
  isDarkTheme,
  setIsDarkTheme,
  soundEnabled,
  setSoundEnabled,
  bagCount,
  activePiece
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none px-6 py-6 md:px-10 flex items-center justify-between">
      {/* Brand & Edition */}
      <div className="pointer-events-auto flex items-center space-x-4">
        <div className="flex flex-col">
          <span className={`font-serif tracking-[0.25em] text-lg md:text-xl font-medium transition-colors duration-500 ${
            isDarkTheme ? 'text-white' : 'text-neutral-900'
          }`}>
            {isDarkTheme ? 'ATELIER VALOIS' : 'NORDRAIL'}
          </span>
          <span className={`font-mono text-[9px] tracking-[0.3em] uppercase transition-colors duration-500 ${
            isDarkTheme ? 'text-atelier-muted' : 'text-nord-muted'
          }`}>
            {isDarkTheme ? 'PARIS • EDITION 04' : 'STOCKHOLM • STUDIO'}
          </span>
        </div>
      </div>

      {/* Center Gallery HUD Indicator */}
      <div className="hidden md:flex items-center space-x-3 pointer-events-none">
        <div className={`px-4 py-1.5 rounded-full text-[11px] font-mono tracking-[0.25em] uppercase border transition-all duration-500 ${
          isDarkTheme 
            ? 'glass-panel-dark text-neutral-300 border-white/10' 
            : 'glass-panel-light text-neutral-700 border-black/10'
        }`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 animate-pulse" />
          3D GALLERY VIEW / PIECE {activePiece.indexStr}
        </div>
      </div>

      {/* Right Controls: Ambience, Theme, Bag */}
      <div className="pointer-events-auto flex items-center space-x-2 md:space-x-3">
        {/* Sound Ambience Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-label="Toggle ambient sound"
          className={`p-2.5 rounded-full border transition-all duration-300 ${
            isDarkTheme
              ? 'glass-panel-dark border-white/10 text-neutral-300 hover:text-white hover:border-white/25'
              : 'glass-panel-light border-black/10 text-neutral-700 hover:text-black hover:border-black/25'
          }`}
          title={soundEnabled ? 'Mute atelier soundscape' : 'Play atelier soundscape'}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          aria-label="Toggle light / dark theme"
          className={`p-2.5 rounded-full border transition-all duration-300 ${
            isDarkTheme
              ? 'glass-panel-dark border-white/10 text-neutral-300 hover:text-white hover:border-white/25'
              : 'glass-panel-light border-black/10 text-neutral-700 hover:text-black hover:border-black/25'
          }`}
          title={isDarkTheme ? 'Switch to Nordrail Daylight (#F6F5F0)' : 'Switch to Atelier Valois Dark'}
        >
          {isDarkTheme ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Shopping Bag Pill */}
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 ${
            isDarkTheme
              ? 'glass-panel-dark border-white/10 text-white hover:border-white/30'
              : 'glass-panel-light border-black/10 text-black hover:border-black/30'
          }`}
        >
          <ShoppingBag size={14} />
          <span>BAG ({bagCount})</span>
        </button>
      </div>
    </header>
  );
}

