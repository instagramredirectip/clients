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
      className={`fixed z-30 transition-all duration-500 flex flex-col justify-between overflow-y-auto shadow-2xl
        /* Mobile: Bottom drawer sheet, leaving top 50vh clear for 3D garment viewing */
        bottom-0 left-0 right-0 max-h-[52vh] rounded-t-3xl border-t p-5 sm:p-6
        /* Desktop: Full-height right sidebar */
        md:top-0 md:bottom-0 md:left-auto md:right-0 md:w-full md:max-w-md md:max-h-full md:rounded-none md:border-t-0 md:border-l md:p-8
        ${
          isDarkTheme
            ? 'glass-panel-dark border-white/15 text-[#F5EBD7] shadow-black/90'
            : 'glass-panel-ivory border-[#046438]/20 text-[#046438] shadow-[#046438]/15'
        }`}
    >
      {/* Mobile Drawer Grab Indicator */}
      <div className="w-12 h-1 rounded-full bg-current opacity-25 mx-auto mb-2.5 md:hidden" />
      <div className="space-y-6">
        {/* Top Header: Badge, Index & Close Button */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDarkTheme ? 'border-white/10' : 'border-[#046438]/15'
        }`}>
          <div className="flex items-center space-x-3">
            <span className={`font-mono text-[10px] tracking-[0.25em] uppercase px-2.5 py-1 rounded border ${
              isDarkTheme 
                ? 'border-emerald-400/30 text-emerald-300 bg-emerald-950/40' 
                : 'border-[#046438]/30 text-[#046438] bg-[#046438]/8 font-medium'
            }`}>
              PIECE {piece.indexStr}
            </span>
            <span className={`font-mono text-[10px] tracking-widest uppercase ${
              isDarkTheme ? 'text-[#F5EBD7]/60' : 'text-[#046438]/70'
            }`}>
              WINTER CAPSULE
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close product view"
            className={`p-2 rounded-full border transition-all duration-300 ${
              isDarkTheme
                ? 'border-white/20 text-[#F5EBD7]/70 hover:text-white hover:border-white/40'
                : 'border-[#046438]/20 text-[#046438]/70 hover:text-[#046438] hover:border-[#046438]/50'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Title, Price & Tagline */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight">
            {piece.title}
          </h1>
          <div className="flex items-baseline space-x-3">
            <span className="font-serif text-xl md:text-2xl font-semibold">
              {piece.priceFormatted}
            </span>
            <span className={`font-mono text-[11px] tracking-wider uppercase ${
              isDarkTheme ? 'text-[#F5EBD7]/60' : 'text-[#046438]/70'
            }`}>
              VAT INCL.
            </span>
          </div>
          <p className={`text-xs leading-relaxed font-light ${
            isDarkTheme ? 'text-[#F5EBD7]/75' : 'text-[#046438]/80'
          }`}>
            {piece.tagline}
          </p>
        </div>

        {/* View Mode Toggle: ON HANGER vs ON MODEL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase">
            <span className={isDarkTheme ? 'text-[#F5EBD7]/60' : 'text-[#046438]/70'}>
              PERSPECTIVE
            </span>
            <span className="font-medium text-[#046438] dark:text-[#F5EBD7]">
              {viewMode === 'hanger' ? 'ARCHITECTURAL DRAPE' : 'STYLED SILHOUETTE'}
            </span>
          </div>
          <div className={`grid grid-cols-2 p-1 rounded-xl border ${
            isDarkTheme ? 'bg-black/40 border-white/10' : 'bg-[#046438]/6 border-[#046438]/15'
          }`}>
            <button
              onClick={() => setViewMode('hanger')}
              className={`py-2 rounded-lg font-mono text-[10px] tracking-widest uppercase transition-all duration-300 ${
                viewMode === 'hanger'
                  ? isDarkTheme
                    ? 'bg-white/20 text-[#F5EBD7] shadow'
                    : 'bg-[#046438] text-[#F5EBD7] shadow'
                  : isDarkTheme
                  ? 'text-[#F5EBD7]/60 hover:text-white'
                  : 'text-[#046438]/70 hover:text-[#046438]'
              }`}
            >
              ON HANGER
            </button>
            <button
              onClick={() => setViewMode('model')}
              className={`py-2 rounded-lg font-mono text-[10px] tracking-widest uppercase transition-all duration-300 ${
                viewMode === 'model'
                  ? isDarkTheme
                    ? 'bg-white/20 text-[#F5EBD7] shadow'
                    : 'bg-[#046438] text-[#F5EBD7] shadow'
                  : isDarkTheme
                  ? 'text-[#F5EBD7]/60 hover:text-white'
                  : 'text-[#046438]/70 hover:text-[#046438]'
              }`}
            >
              ON MODEL
            </button>
          </div>
        </div>

        {/* Colorway Swatches with GLSL Wipe Trigger */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase">
            <span className={isDarkTheme ? 'text-[#F5EBD7]/70' : 'text-[#046438]/80'}>
              COLORWAY: <strong className={isDarkTheme ? 'text-white' : 'text-[#046438]'}>{activeColor.name}</strong>
            </span>
            <span className={`text-[10px] flex items-center space-x-1 ${
              isDarkTheme ? 'text-emerald-300' : 'text-[#046438]'
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
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-[#046438] scale-110 shadow-lg shadow-[#046438]/25'
                      : 'border-transparent hover:scale-105'
                  }`}
                  title={`Select ${color.name} (GLSL color wipe)`}
                >
                  <span
                    className="block w-6 h-6 rounded-full shadow-inner border border-black/15"
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
            <span className={isDarkTheme ? 'text-[#F5EBD7]/60' : 'text-[#046438]/70'}>
              SIZE (EU / CHEST)
            </span>
            <span className={`text-[10px] underline cursor-pointer ${
              isDarkTheme ? 'text-[#F5EBD7]/70 hover:text-white' : 'text-[#046438]/75 hover:text-[#046438]'
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
                        ? 'bg-[#F5EBD7] text-[#046438] border-[#F5EBD7] font-semibold shadow'
                        : 'bg-[#046438] text-[#F5EBD7] border-[#046438] font-semibold shadow'
                      : isDarkTheme
                      ? 'border-white/15 text-[#F5EBD7]/70 hover:border-white/35'
                      : 'border-[#046438]/20 text-[#046438]/80 hover:border-[#046438]/40'
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
            className={`w-full py-4 rounded-xl font-mono text-xs tracking-[0.2em] uppercase font-semibold shadow-xl flex items-center justify-center space-x-2 transition-all duration-300 ${
              addedAnimation
                ? 'bg-emerald-700 text-white'
                : isDarkTheme
                ? 'bg-[#F5EBD7] text-[#046438] hover:bg-white'
                : 'bg-[#046438] text-[#F5EBD7] hover:bg-[#034a29] shadow-[#046438]/20'
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
        <div className={`divide-y pt-2 text-xs ${
          isDarkTheme ? 'divide-white/10' : 'divide-[#046438]/15'
        }`}>
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
                isDarkTheme ? 'border-emerald-400/40 text-[#F5EBD7]/80' : 'border-[#046438]/40 text-[#046438]/85'
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
                isDarkTheme ? 'text-[#F5EBD7]/80' : 'text-[#046438]/85'
              }`}>
                <p className={`font-mono text-[10px] uppercase tracking-widest font-medium ${
                  isDarkTheme ? 'text-emerald-300' : 'text-[#046438]'
                }`}>
                  {piece.composition}
                </p>
                <ul className="space-y-1 pl-3 border-l-2 border-[#046438]/20">
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
                isDarkTheme ? 'text-[#F5EBD7]/80' : 'text-[#046438]/85'
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
                isDarkTheme ? 'text-[#F5EBD7]/80' : 'text-[#046438]/85'
              }`}>
                <div className="flex items-center space-x-2 text-[11px]">
                  <Truck size={14} className="text-[#046438] dark:text-emerald-300" />
                  <span>Complimentary armored global courier delivery (2-3 days).</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <RefreshCw size={14} className="text-[#046438] dark:text-emerald-300" />
                  <span>30-day white-glove atelier fitting exchanges.</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <ShieldCheck size={14} className="text-[#046438] dark:text-emerald-300" />
                  <span>Lifetime seam & button restoration warranty included.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Atelier Note */}
      <div className={`pt-6 border-t font-mono text-[9px] tracking-[0.25em] uppercase text-center ${
        isDarkTheme ? 'border-white/10 text-[#F5EBD7]/50' : 'border-[#046438]/15 text-[#046438]/60 font-medium'
      }`}>
        HANDCRAFTED IN PARIS & MILAN • EDITION OF 40 PIECES
      </div>
    </aside>
  );
}
