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
          <span className={`font-serif tracking-[0.25em] text-lg md:text-xl font-semibold transition-colors duration-500 ${
            isDarkTheme ? 'text-[#F5EBD7]' : 'text-[#046438]'
          }`}>
            ATELIER VALOIS
          </span>
          <span className={`font-mono text-[9px] tracking-[0.3em] uppercase transition-colors duration-500 ${
            isDarkTheme ? 'text-[#F5EBD7]/60' : 'text-[#046438]/70'
          }`}>
            WARM IVORY & EMERALD • CAPSULE
          </span>
        </div>
      </div>

      {/* Center Gallery HUD Indicator */}
      <div className="hidden md:flex items-center space-x-3 pointer-events-none">
        <div className={`px-4 py-1.5 rounded-full text-[11px] font-mono tracking-[0.25em] uppercase border transition-all duration-500 ${
          isDarkTheme 
            ? 'glass-panel-dark text-[#F5EBD7] border-white/15' 
            : 'glass-panel-ivory text-[#046438] border-[#046438]/20'
        }`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#046438] dark:bg-[#F5EBD7] mr-2 animate-pulse" />
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
              ? 'glass-panel-dark border-white/15 text-[#F5EBD7] hover:border-white/35'
              : 'glass-panel-ivory border-[#046438]/20 text-[#046438] hover:border-[#046438]/45'
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
              ? 'glass-panel-dark border-white/15 text-[#F5EBD7] hover:border-white/35'
              : 'glass-panel-ivory border-[#046438]/20 text-[#046438] hover:border-[#046438]/45'
          }`}
          title={isDarkTheme ? 'Switch to Warm Ivory Studio (#F5EBD7)' : 'Switch to Deep Emerald Night'}
        >
          {isDarkTheme ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Shopping Bag Pill */}
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-md ${
            isDarkTheme
              ? 'bg-[#F5EBD7] text-[#046438] border-[#F5EBD7] hover:bg-white'
              : 'bg-[#046438] text-[#F5EBD7] border-[#034a29] hover:bg-[#034a29]'
          }`}
        >
          <ShoppingBag size={14} />
          <span>BAG ({bagCount})</span>
        </button>
      </div>
    </header>
  );
}
