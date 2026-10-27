import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { PIECES } from '../data/pieces';

export default function BottomHUD({
  activePiece,
  activePieceIndex,
  onPrevPiece,
  onNextPiece,
  onSelectPiece,
  onExplore,
  isExploring,
  isDarkTheme
}) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-20 pointer-events-none pb-8 pt-12 px-6 md:px-12 flex flex-col items-center justify-end transition-all duration-700 ${
        isExploring ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Floating Center Caption & Action Card */}
      <div className="pointer-events-auto w-full max-w-xl mx-auto flex flex-col items-center">
        <div
          className={`w-full p-6 md:p-7 rounded-2xl border transition-all duration-500 shadow-2xl ${
            isDarkTheme
              ? 'glass-panel-dark border-white/10 text-white shadow-black/60'
              : 'glass-panel-light border-black/10 text-neutral-900 shadow-neutral-400/30'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            {/* Title & Specs */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className={`font-mono text-[10px] tracking-[0.25em] uppercase px-2 py-0.5 rounded border ${
                  isDarkTheme ? 'border-amber-400/30 text-amber-300' : 'border-amber-700/30 text-amber-800'
                }`}>
                  PIECE {activePiece.indexStr}
                </span>
                <span className={`font-mono text-[10px] tracking-widest uppercase ${
                  isDarkTheme ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  {activePiece.fabric}
                </span>
              </div>
              <h2 className="font-serif text-xl md:text-2xl font-normal tracking-wide">
                {activePiece.title}
              </h2>
              <p className={`text-xs max-w-sm line-clamp-1 font-light ${
                isDarkTheme ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                {activePiece.tagline}
              </p>
            </div>

            {/* Price & Explore Button */}
            <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <span className="font-serif text-lg md:text-xl font-medium tracking-tight">
                {activePiece.priceFormatted}
              </span>
              <button
                onClick={onExplore}
                className={`group flex items-center space-x-2 px-5 py-2.5 rounded-full font-mono text-[11px] tracking-widest uppercase font-medium shadow-lg transition-all duration-300 ${
                  isDarkTheme ? 'btn-luxury-dark' : 'btn-luxury-light'
                }`}
              >
                <span>EXPLORE PIECE</span>
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Controls: Arrows + Dots */}
        <div className="flex items-center justify-between w-full max-w-sm mt-5">
          {/* Left Arrow */}
          <button
            onClick={onPrevPiece}
            disabled={activePieceIndex === 0}
            aria-label="Previous piece"
            className={`p-3 rounded-full border transition-all duration-300 ${
              activePieceIndex === 0
                ? 'opacity-25 cursor-not-allowed border-transparent'
                : isDarkTheme
                ? 'glass-panel-dark border-white/15 text-white hover:border-white/40 hover:scale-105 active:scale-95'
                : 'glass-panel-light border-black/15 text-black hover:border-black/40 hover:scale-105 active:scale-95'
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Pagination Indicators */}
          <div className="flex items-center space-x-2.5">
            {PIECES.map((p, idx) => {
              const isActive = idx === activePieceIndex;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPiece(idx)}
                  aria-label={`Select piece ${p.number}`}
                  className={`transition-all duration-500 rounded-full ${
                    isActive
                      ? `w-8 h-1.5 ${isDarkTheme ? 'bg-white' : 'bg-black'}`
                      : `w-1.5 h-1.5 ${isDarkTheme ? 'bg-white/30 hover:bg-white/60' : 'bg-black/30 hover:bg-black/60'}`
                  }`}
                />
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={onNextPiece}
            disabled={activePieceIndex === PIECES.length - 1}
            aria-label="Next piece"
            className={`p-3 rounded-full border transition-all duration-300 ${
              activePieceIndex === PIECES.length - 1
                ? 'opacity-25 cursor-not-allowed border-transparent'
                : isDarkTheme
                ? 'glass-panel-dark border-white/15 text-white hover:border-white/40 hover:scale-105 active:scale-95'
                : 'glass-panel-light border-black/15 text-black hover:border-black/40 hover:scale-105 active:scale-95'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Ambient Interaction Guide */}
        <span
          className={`font-mono text-[9px] tracking-[0.3em] uppercase mt-4 transition-colors duration-500 ${
            isDarkTheme ? 'text-neutral-500' : 'text-neutral-400'
          }`}
        >
          DRAG TO ROTATE • SCROLL TO NAVIGATE
        </span>
      </div>
    </div>
  );
}

