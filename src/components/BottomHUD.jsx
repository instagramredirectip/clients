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
      className={`fixed bottom-0 left-0 right-0 z-20 pointer-events-none pb-4 pt-4 px-4 md:pb-8 md:pt-12 md:px-12 flex flex-col items-center justify-end transition-all duration-700 ${
        isExploring ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Floating Center Caption & Action Card */}
      <div className="pointer-events-auto w-full max-w-xl mx-auto flex flex-col items-center">
        {/* MOBILE COMPACT HUD */}
        <div
          className={`w-full md:hidden p-3 rounded-2xl border transition-all duration-500 shadow-xl ${
            isDarkTheme
              ? 'glass-panel-dark border-white/15 text-[#F5EBD7] shadow-black/80'
              : 'glass-panel-ivory border-[#046438]/20 text-[#046438] shadow-[#046438]/10'
          }`}
        >
          {/* Row 1: Piece Tag, Title & Price */}
          <div className="flex items-center justify-between pb-2 border-b border-current/10">
            <div className="flex items-center space-x-2 truncate pr-2">
              <span className={`font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border flex-shrink-0 ${
                isDarkTheme 
                  ? 'border-emerald-400/30 text-emerald-300 bg-emerald-950/40' 
                  : 'border-[#046438]/30 text-[#046438] bg-[#046438]/8 font-medium'
              }`}>
                {activePiece.number} / 05
              </span>
              <span className="font-serif text-sm font-medium tracking-tight truncate">
                {activePiece.title}
              </span>
            </div>
            <span className="font-serif text-sm font-semibold tracking-tight flex-shrink-0">
              {activePiece.priceFormatted}
            </span>
          </div>

          {/* Row 2: Carousel Controls + Explore Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onPrevPiece}
                disabled={activePieceIndex === 0}
                aria-label="Previous piece"
                className={`p-1.5 rounded-full border transition-all ${
                  activePieceIndex === 0 ? 'opacity-20 border-transparent' : 'border-current/20 active:scale-90'
                }`}
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center space-x-1 px-1">
                {PIECES.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPiece(idx)}
                    aria-label={`Piece ${p.number}`}
                    className={`transition-all duration-300 rounded-full ${
                      idx === activePieceIndex
                        ? `w-4 h-1 ${isDarkTheme ? 'bg-[#F5EBD7]' : 'bg-[#046438]'}`
                        : `w-1 h-1 ${isDarkTheme ? 'bg-white/30' : 'bg-[#046438]/30'}`
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={onNextPiece}
                disabled={activePieceIndex === PIECES.length - 1}
                aria-label="Next piece"
                className={`p-1.5 rounded-full border transition-all ${
                  activePieceIndex === PIECES.length - 1 ? 'opacity-20 border-transparent' : 'border-current/20 active:scale-90'
                }`}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <button
              onClick={onExplore}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full font-mono text-[10px] tracking-wider uppercase font-semibold shadow transition-transform active:scale-95 ${
                isDarkTheme
                  ? 'bg-[#F5EBD7] text-[#046438]'
                  : 'bg-[#046438] text-[#F5EBD7]'
              }`}
            >
              <span>EXPLORE</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* DESKTOP HUD */}
        <div
          className={`hidden md:block w-full p-6 md:p-7 rounded-2xl border transition-all duration-500 shadow-2xl ${
            isDarkTheme
              ? 'glass-panel-dark border-white/15 text-[#F5EBD7] shadow-black/80'
              : 'glass-panel-ivory border-[#046438]/20 text-[#046438] shadow-[#046438]/10'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            {/* Title & Specs */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className={`font-mono text-[10px] tracking-[0.25em] uppercase px-2 py-0.5 rounded border ${
                  isDarkTheme 
                    ? 'border-emerald-400/30 text-emerald-300 bg-emerald-950/40' 
                    : 'border-[#046438]/30 text-[#046438] bg-[#046438]/8 font-medium'
                }`}>
                  PIECE {activePiece.indexStr}
                </span>
                <span className={`font-mono text-[10px] tracking-widest uppercase ${
                  isDarkTheme ? 'text-[#F5EBD7]/60' : 'text-[#046438]/70'
                }`}>
                  {activePiece.fabric}
                </span>
              </div>
              <h2 className="font-serif text-xl md:text-2xl font-medium tracking-wide">
                {activePiece.title}
              </h2>
              <p className={`text-xs max-w-sm line-clamp-1 font-light ${
                isDarkTheme ? 'text-[#F5EBD7]/70' : 'text-[#046438]/80'
              }`}>
                {activePiece.tagline}
              </p>
            </div>

            {/* Price & Explore Button */}
            <div className={`flex items-center justify-between md:flex-col md:items-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 ${
              isDarkTheme ? 'border-white/10' : 'border-[#046438]/15'
            }`}>
              <span className="font-serif text-lg md:text-xl font-semibold tracking-tight">
                {activePiece.priceFormatted}
              </span>
              <button
                onClick={onExplore}
                className={`group flex items-center space-x-2 px-5 py-2.5 rounded-full font-mono text-[11px] tracking-widest uppercase font-medium shadow-lg transition-all duration-300 ${
                  isDarkTheme
                    ? 'bg-[#F5EBD7] text-[#046438] hover:bg-white'
                    : 'bg-[#046438] text-[#F5EBD7] hover:bg-[#034a29] shadow-[#046438]/20'
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

        {/* Desktop Carousel Controls: Arrows + Dots */}
        <div className="hidden md:flex items-center justify-between w-full max-w-sm mt-5">
          {/* Left Arrow */}
          <button
            onClick={onPrevPiece}
            disabled={activePieceIndex === 0}
            aria-label="Previous piece"
            className={`p-3 rounded-full border transition-all duration-300 ${
              activePieceIndex === 0
                ? 'opacity-25 cursor-not-allowed border-transparent'
                : isDarkTheme
                ? 'glass-panel-dark border-white/20 text-[#F5EBD7] hover:border-white/50 hover:scale-105 active:scale-95'
                : 'glass-panel-ivory border-[#046438]/25 text-[#046438] hover:border-[#046438]/60 hover:scale-105 active:scale-95'
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
                      ? `w-8 h-1.5 ${isDarkTheme ? 'bg-[#F5EBD7]' : 'bg-[#046438]'}`
                      : `w-1.5 h-1.5 ${isDarkTheme ? 'bg-white/30 hover:bg-white/60' : 'bg-[#046438]/30 hover:bg-[#046438]/60'}`
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
                ? 'glass-panel-dark border-white/20 text-[#F5EBD7] hover:border-white/50 hover:scale-105 active:scale-95'
                : 'glass-panel-ivory border-[#046438]/25 text-[#046438] hover:border-[#046438]/60 hover:scale-105 active:scale-95'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Ambient Interaction Guide */}
        <span
          className={`font-mono text-[9px] tracking-[0.3em] uppercase mt-2.5 md:mt-4 transition-colors duration-500 ${
            isDarkTheme ? 'text-[#F5EBD7]/50' : 'text-[#046438]/60 font-medium'
          }`}
        >
          DRAG TO ROTATE • SCROLL TO NAVIGATE
        </span>
      </div>
    </div>
  );
}
