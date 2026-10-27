import React, { useState } from 'react';
import { X, Check, ChevronDown, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function ProductDetailCard({
  piece,
  activeColorIndex,
  onSelectColor,
  viewMode,
  setViewMode,
  onClose,
  onAddToBag,
  isDarkTheme
}) {
  const [selectedSize, setSelectedSize] = useState('48');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState('details');

  const handleAdd = () => {
    setAddedAnimation(true);
    onAddToBag();
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1600);
  };

  const toggleAccordion = (key) => {
    setExpandedAccordion(expandedAccordion === key ? null : key);
  };

  const activeColor = piece.colors[activeColorIndex] || piece.colors[0];

  return (
    <aside
      className={`fixed top-0 right-0 bottom-0 z-30 w-full max-w-lg md:max-w-md p-6 md:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl transition-all duration-700 ${
        isDarkTheme
          ? 'glass-panel-dark border-l border-white/10 text-white shadow-black/80'
          : 'glass-panel-light border-l border-black/10 text-neutral-900 shadow-neutral-500/20'
      }`}
    >
      <div className="space-y-6">
        {/* Top Header: Badge, Index & Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <span className={`font-mono text-[10px] tracking-[0.25em] uppercase px-2.5 py-1 rounded border ${
              isDarkTheme ? 'border-amber-400/30 text-amber-300' : 'border-amber-800/30 text-amber-800'
            }`}>
              PIECE {piece.indexStr}
            </span>
            <span className={`font-mono text-[10px] tracking-widest uppercase ${
              isDarkTheme ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              WINTER CAPSULE
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close product view"
            className={`p-2 rounded-full border transition-all duration-300 ${
              isDarkTheme
                ? 'border-white/15 text-neutral-400 hover:text-white hover:border-white/40'
                : 'border-black/15 text-neutral-600 hover:text-black hover:border-black/40'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Title, Price & Tagline */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl md:text-3xl font-normal tracking-tight">
            {piece.title}
          </h1>
          <div className="flex items-baseline space-x-3">
            <span className="font-serif text-xl md:text-2xl font-medium">
              {piece.priceFormatted}
            </span>
            <span className={`font-mono text-[11px] tracking-wider uppercase ${
              isDarkTheme ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              VAT INCL.
            </span>
          </div>
          <p className={`text-xs leading-relaxed font-light ${
            isDarkTheme ? 'text-neutral-300' : 'text-neutral-600'
          }`}>
            {piece.tagline}
          </p>
        </div>

        {/* View Mode Toggle: ON HANGER vs ON MODEL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase">
            <span className={isDarkTheme ? 'text-neutral-400' : 'text-neutral-500'}>
              PERSPECTIVE
            </span>
            <span className="text-amber-500 font-medium">
              {viewMode === 'hanger' ? 'ARCHITECTURAL DRAPE' : 'STYLED SILHOUETTE'}
            </span>
          </div>
          <div className={`grid grid-cols-2 p-1 rounded-xl border ${
            isDarkTheme ? 'bg-black/30 border-white/10' : 'bg-black/5 border-black/10'
          }`}>
            <button
              onClick={() => setViewMode('hanger')}
              className={`py-2 rounded-lg font-mono text-[10px] tracking-widest uppercase transition-all duration-300 ${
                viewMode === 'hanger'
                  ? isDarkTheme
                    ? 'bg-white/15 text-white shadow'
                    : 'bg-white text-black shadow'
                  : isDarkTheme
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              ON HANGER
            </button>
            <button
              onClick={() => setViewMode('model')}
              className={`py-2 rounded-lg font-mono text-[10px] tracking-widest uppercase transition-all duration-300 ${
                viewMode === 'model'
                  ? isDarkTheme
                    ? 'bg-white/15 text-white shadow'
                    : 'bg-white text-black shadow'
                  : isDarkTheme
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              ON MODEL
            </button>
          </div>
        </div>

        {/* Colorway Swatches with GLSL Wipe Trigger */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase">
            <span className={isDarkTheme ? 'text-neutral-400' : 'text-neutral-500'}>
              COLORWAY: <strong className={isDarkTheme ? 'text-white' : 'text-black'}>{activeColor.name}</strong>
            </span>
            <span className={`text-[10px] flex items-center space-x-1 ${
              isDarkTheme ? 'text-amber-400' : 'text-amber-700'
            }`}>
              <Sparkles size={11} />
              <span>LIVE GLSL DYE</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {piece.colors.map((color, idx) => {
              const isSelected = idx === activeColorIndex;
              return (
                <button
                  key={color.name}
                  onClick={() => onSelectColor(idx)}
                  className={`group relative p-1 rounded-full border transition-all duration-300 ${
                    isSelected
                      ? isDarkTheme
                        ? 'border-white scale-110'
                        : 'border-black scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  title={`Select ${color.name} (GLSL color wipe)`}
                >
                  <span
                    className="block w-6 h-6 rounded-full shadow-inner border border-white/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  {isSelected && (
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      {color.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase">
            <span className={isDarkTheme ? 'text-neutral-400' : 'text-neutral-500'}>
              SIZE (EU / CHEST)
            </span>
            <span className={`text-[10px] underline cursor-pointer ${
              isDarkTheme ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
            }`}>
              SIZE GUIDE
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {piece.sizes.map((size) => {
              const isSelected = size === selectedSize;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 rounded-lg font-mono text-xs tracking-wider transition-all duration-300 border ${
                    isSelected
                      ? isDarkTheme
                        ? 'bg-white text-black border-white font-medium shadow'
                        : 'bg-black text-white border-black font-medium shadow'
                      : isDarkTheme
                      ? 'border-white/10 text-neutral-300 hover:border-white/30'
                      : 'border-black/10 text-neutral-700 hover:border-black/30'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add to Bag Button */}
        <div className="pt-2">
          <button
            onClick={handleAdd}
            disabled={addedAnimation}
            className={`w-full py-4 rounded-xl font-mono text-xs tracking-[0.2em] uppercase font-medium shadow-xl flex items-center justify-center space-x-2 transition-all duration-300 ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : isDarkTheme
                ? 'btn-luxury-dark'
                : 'btn-luxury-light'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check size={16} />
                <span>ADDED TO BAG</span>
              </>
            ) : (
              <span>ADD TO BAG — {piece.priceFormatted}</span>
            )}
          </button>
        </div>

        {/* Expandable Accordions */}
        <div className="divide-y divide-white/10 pt-2 text-xs">
          {/* Details */}
          <div className="py-3">
            <button
              onClick={() => toggleAccordion('details')}
              className="w-full flex items-center justify-between font-mono text-[11px] tracking-wider uppercase text-left py-1"
            >
              <span>SPECIFICATIONS & CRAFT</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${
                  expandedAccordion === 'details' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedAccordion === 'details' && (
              <ul className={`mt-2 space-y-1.5 font-light pl-3 border-l-2 ${
                isDarkTheme ? 'border-amber-400/40 text-neutral-300' : 'border-amber-800/40 text-neutral-700'
              }`}>
                {piece.details.map((detail, idx) => (
                  <li key={idx} className="leading-relaxed">
                    • {detail}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Fabric & Care */}
          <div className="py-3">
            <button
              onClick={() => toggleAccordion('fabric')}
              className="w-full flex items-center justify-between font-mono text-[11px] tracking-wider uppercase text-left py-1"
            >
              <span>FABRICATION & PROVENANCE</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${
                  expandedAccordion === 'fabric' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedAccordion === 'fabric' && (
              <div className={`mt-2 space-y-2 font-light ${
                isDarkTheme ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                <p className="font-mono text-[10px] text-amber-500 uppercase tracking-widest">
                  {piece.composition}
                </p>
                <ul className="space-y-1 pl-3 border-l-2 border-white/20">
                  {piece.fabricCare.map((care, idx) => (
                    <li key={idx} className="leading-relaxed">
                      • {care}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Fit & Sizing */}
          <div className="py-3">
            <button
              onClick={() => toggleAccordion('fit')}
              className="w-full flex items-center justify-between font-mono text-[11px] tracking-wider uppercase text-left py-1"
            >
              <span>FIT & DRAPE NOTES</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${
                  expandedAccordion === 'fit' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedAccordion === 'fit' && (
              <p className={`mt-2 leading-relaxed font-light ${
                isDarkTheme ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                {piece.fitSizing}
              </p>
            )}
          </div>

          {/* Shipping & Returns */}
          <div className="py-3">
            <button
              onClick={() => toggleAccordion('shipping')}
              className="w-full flex items-center justify-between font-mono text-[11px] tracking-wider uppercase text-left py-1"
            >
              <span>BESPOKE DELIVERY & GUARANTEE</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${
                  expandedAccordion === 'shipping' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedAccordion === 'shipping' && (
              <div className={`mt-2 space-y-2 font-light ${
                isDarkTheme ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                <div className="flex items-center space-x-2 text-[11px]">
                  <Truck size={14} className="text-amber-500" />
                  <span>Complimentary armored global courier delivery (2-3 days).</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <RefreshCw size={14} className="text-amber-500" />
                  <span>30-day white-glove atelier fitting exchanges.</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <ShieldCheck size={14} className="text-amber-500" />
                  <span>Lifetime seam & button restoration warranty included.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Atelier Note */}
      <div className={`pt-6 border-t border-white/10 text-center font-mono text-[9px] tracking-[0.25em] uppercase ${
        isDarkTheme ? 'text-neutral-500' : 'text-neutral-400'
      }`}>
        HANDCRAFTED IN PARIS & MILAN • EDITION OF 40 PIECES
      </div>
    </aside>
  );
}

