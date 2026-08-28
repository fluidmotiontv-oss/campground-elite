import React, { useState, useMemo } from 'react';
import { 
  Campsite, 
  Reservation, 
  ParkLoop, 
  SiteType, 
  SiteStatus 
} from '../types';
import { PARK_POINTS_OF_INTEREST } from '../data/mockCampgroundData';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  CheckCircle2, 
  User, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  Info,
  Waves,
  Store,
  Bath,
  Flame,
  Sun,
  Heart,
  Fuel,
  Music,
  Anchor,
  Compass
} from 'lucide-react';

interface InteractiveParkMapProps {
  sites: Campsite[];
  reservations: Reservation[];
  selectedSiteId: string | null;
  onSelectSite: (site: Campsite) => void;
  onNewBookingForSite?: (site: Campsite) => void;
}

export const InteractiveParkMap: React.FC<InteractiveParkMapProps> = ({
  sites,
  reservations,
  selectedSiteId,
  onSelectSite,
  onNewBookingForSite
}) => {
  const [selectedLoop, setSelectedLoop] = useState<ParkLoop | 'ALL'>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'RV' | 'GLAMPING' | 'CABIN' | 'TENT'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<SiteStatus | 'ALL'>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredSite, setHoveredSite] = useState<Campsite | null>(null);
  const [hoveredPoi, setHoveredPoi] = useState<any | null>(null);

  // Filtered sites
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      if (selectedLoop !== 'ALL' && site.loop !== selectedLoop) return false;
      if (selectedStatusFilter !== 'ALL' && site.status !== selectedStatusFilter) return false;
      if (selectedTypeFilter !== 'ALL') {
        if (selectedTypeFilter === 'RV' && !site.type.startsWith('rv_')) return false;
        if (selectedTypeFilter === 'GLAMPING' && !site.type.startsWith('glamping_') && site.type !== 'eco_pod') return false;
        if (selectedTypeFilter === 'CABIN' && site.type !== 'waterfront_cabin') return false;
        if (selectedTypeFilter === 'TENT' && !site.type.startsWith('tent_')) return false;
      }
      return true;
    });
  }, [sites, selectedLoop, selectedTypeFilter, selectedStatusFilter]);

  // Quick stats
  const stats = useMemo(() => {
    const total = sites.length;
    const occupied = sites.filter(s => s.status === 'occupied').length;
    const vacant = sites.filter(s => s.status === 'vacant').length;
    const reserved = sites.filter(s => s.status === 'reserved').length;
    const maintenance = sites.filter(s => s.status === 'maintenance_blocked' || s.status === 'cleaning_needed').length;
    return { total, occupied, vacant, reserved, maintenance };
  }, [sites]);

  const getStatusColor = (status: SiteStatus) => {
    switch (status) {
      case 'vacant':
        return {
          fill: '#10b981', // emerald
          border: '#059669',
          glow: 'rgba(16, 185, 129, 0.4)',
          text: 'Vacant',
          bgClass: 'bg-emerald-500 text-white'
        };
      case 'occupied':
        return {
          fill: '#3b82f6', // blue
          border: '#2563eb',
          glow: 'rgba(59, 130, 246, 0.4)',
          text: 'Occupied',
          bgClass: 'bg-blue-600 text-white'
        };
      case 'reserved':
        return {
          fill: '#f59e0b', // amber
          border: '#d97706',
          glow: 'rgba(245, 158, 11, 0.4)',
          text: 'Reserved',
          bgClass: 'bg-amber-500 text-slate-950'
        };
      case 'cleaning_needed':
        return {
          fill: '#f97316', // orange
          border: '#ea580c',
          glow: 'rgba(249, 115, 22, 0.4)',
          text: 'Cleaning Needed',
          bgClass: 'bg-orange-500 text-white'
        };
      case 'maintenance_blocked':
        return {
          fill: '#ef4444', // red
          border: '#dc2626',
          glow: 'rgba(239, 68, 68, 0.4)',
          text: 'Blocked / Maint',
          bgClass: 'bg-rose-600 text-white'
        };
      default:
        return {
          fill: '#64748b',
          border: '#475569',
          glow: 'transparent',
          text: 'Unknown',
          bgClass: 'bg-slate-600 text-white'
        };
    }
  };

  const getPoiIcon = (iconName: string) => {
    switch (iconName) {
      case 'Waves': return <Waves className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Anchor': return <Anchor className="w-3.5 h-3.5 text-blue-400" />;
      case 'Store': return <Store className="w-3.5 h-3.5 text-amber-400" />;
      case 'Bath': return <Bath className="w-3.5 h-3.5 text-teal-300" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'Sun': return <Sun className="w-3.5 h-3.5 text-yellow-300" />;
      case 'Heart': return <Heart className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Fuel': return <Fuel className="w-3.5 h-3.5 text-slate-300" />;
      case 'Music': return <Music className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Info className="w-3.5 h-3.5 text-slate-300" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      
      {/* Control Bar: Filters & Zoom */}
      <div className="bg-slate-900/95 border-b border-slate-800 p-3 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 backdrop-blur">
        
        {/* Loop Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Loop:
          </span>
          {(['ALL', 'Lakeside Ridge', 'Pine Forest Haven', 'Meadowbrook Loop', 'Canyon Creek'] as const).map((loop) => (
            <button
              key={loop}
              onClick={() => setSelectedLoop(loop)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedLoop === loop
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {loop === 'ALL' ? 'All Loops (28)' : loop}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Type:</span>
          {(['ALL', 'RV', 'GLAMPING', 'CABIN', 'TENT'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                selectedTypeFilter === type
                  ? 'bg-slate-700 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Status Filter & Zoom */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses ({sites.length})</option>
            <option value="vacant">Vacant ({stats.vacant})</option>
            <option value="occupied">Occupied ({stats.occupied})</option>
            <option value="reserved">Reserved ({stats.reserved})</option>
            <option value="cleaning_needed">Cleaning Needed</option>
            <option value="maintenance_blocked">Blocked / Maint</option>
          </select>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.15))}
              className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
              className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border-l border-slate-700"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4 min-h-[560px]">
        
        <div 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200 relative w-[980px] h-[640px] select-none rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0e1726]"
        >
          {/* SVG Map Layout */}
          <svg className="w-full h-full" viewBox="0 0 1000 650">
            <defs>
              {/* Lake Gradient */}
              <linearGradient id="lakeWater" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#083344" />
                <stop offset="50%" stopColor="#0e4e68" />
                <stop offset="100%" stopColor="#155e75" />
              </linearGradient>

              {/* Forest Gradient */}
              <radialGradient id="forestGlow" cx="70%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
              </radialGradient>

              {/* Canyon Wall Pattern */}
              <linearGradient id="canyonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#292524" />
                <stop offset="100%" stopColor="#1c1917" />
              </linearGradient>

              {/* Glow filter for active sites */}
              <filter id="siteGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Base Terrain */}
            <rect width="1000" height="650" fill="#0f172a" />
            
            {/* Natural Topographic Contour / Forest Zones */}
            <path 
              d="M 550,0 Q 650,200 800,250 T 1000,450 L 1000,0 Z" 
              fill="#062e26" 
              opacity="0.85" 
            />
            <circle cx="720" cy="480" r="280" fill="url(#forestGlow)" />
            
            {/* Canyon Creek Rock Formation (Bottom Center-Right) */}
            <path 
              d="M 320,400 Q 420,380 580,480 T 600,650 L 300,650 Z" 
              fill="url(#canyonGrad)" 
              opacity="0.9" 
            />

            {/* Emerald Lake Water Body (Top Left) */}
            <path
              d="M 0,0 L 520,0 Q 480,120 400,160 Q 300,200 180,210 Q 80,220 0,260 Z"
              fill="url(#lakeWater)"
            />
            {/* Subtle Lake Wave lines */}
            <path d="M 60,60 Q 120,40 180,60 T 300,50" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.3" strokeDasharray="6,6" />
            <path d="M 120,110 Q 200,90 280,110 T 380,95" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.3" strokeDasharray="6,6" />
            <path d="M 40,160 Q 110,140 190,160" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.3" strokeDasharray="6,6" />

            {/* Mountain Creek River Stream flowing through Canyon into Lake */}
            <path
              d="M 560,650 Q 520,560 480,480 T 400,380 T 340,260 T 260,190"
              fill="none"
              stroke="#0891b2"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M 560,650 Q 520,560 480,480 T 400,380 T 340,260 T 260,190"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Main Park Access Roads (Paved Asphalt Dark Gray with center dashed line) */}
            {/* Primary Entrance Road from South-West (Bottom-Left) */}
            <path
              d="M 0,540 Q 90,520 160,460 T 260,340"
              fill="none"
              stroke="#334155"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 0,540 Q 90,520 160,460 T 260,340"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="8,8"
              opacity="0.5"
            />

            {/* Loop A Road: Lakeside Ridge */}
            <path
              d="M 160,460 Q 180,320 220,240 T 360,180 T 540,170 Q 580,240 520,320 T 320,360"
              fill="none"
              stroke="#334155"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 160,460 Q 180,320 220,240 T 360,180 T 540,170 Q 580,240 520,320 T 320,360"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="6,6"
              opacity="0.4"
            />

            {/* Loop B Road: Pine Forest Haven */}
            <path
              d="M 520,320 Q 640,280 740,320 T 840,460 T 720,580 T 560,540"
              fill="none"
              stroke="#334155"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M 520,320 Q 640,280 740,320 T 840,460 T 720,580 T 560,540"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="6,6"
              opacity="0.4"
            />

            {/* Loop C Road: Meadowbrook Loop (Bottom) */}
            <path
              d="M 160,460 Q 160,560 220,600 T 380,620 T 440,540 T 320,440"
              fill="none"
              stroke="#334155"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M 160,460 Q 160,560 220,600 T 380,620 T 440,540 T 320,440"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="6,6"
              opacity="0.4"
            />

            {/* Loop D Road: Canyon Creek Connector */}
            <path
              d="M 320,360 Q 420,380 480,440 T 540,560"
              fill="none"
              stroke="#334155"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M 320,360 Q 420,380 480,440 T 540,560"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="6,6"
              opacity="0.4"
            />

            {/* Walking Nature Trails (Dotted Ochre) */}
            <path
              d="M 400,160 Q 480,80 560,100 T 760,180 T 880,320"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="4,4"
              opacity="0.7"
            />
            <path
              d="M 280,380 Q 220,420 140,400 T 40,320"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="4,4"
              opacity="0.7"
            />

            {/* Loop Zone Badges / Text Labels */}
            <g opacity="0.85">
              {/* Loop A */}
              <rect x="250" y="270" width="160" height="24" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
              <text x="330" y="286" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                LOOP A: LAKESIDE RIDGE
              </text>

              {/* Loop B */}
              <rect x="660" y="440" width="170" height="24" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
              <text x="745" y="456" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">
                LOOP B: PINE FOREST HAVEN
              </text>

              {/* Loop C */}
              <rect x="220" y="530" width="165" height="24" rx="6" fill="#0f172a" stroke="#eab308" strokeWidth="1" />
              <text x="302" y="546" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">
                LOOP C: MEADOWBROOK
              </text>

              {/* Loop D */}
              <rect x="420" y="490" width="150" height="24" rx="6" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
              <text x="495" y="506" fill="#fb923c" fontSize="11" fontWeight="bold" textAnchor="middle">
                LOOP D: CANYON CREEK
              </text>
            </g>

            {/* Facility & Point of Interest Markers */}
            {PARK_POINTS_OF_INTEREST.map((poi) => {
              const posX = (poi.x / 100) * 1000;
              const posY = (poi.y / 100) * 650;
              const isHovered = hoveredPoi?.id === poi.id;

              return (
                <g 
                  key={poi.id}
                  transform={`translate(${posX}, ${posY})`}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoi(poi)}
                  onMouseLeave={() => setHoveredPoi(null)}
                >
                  <circle
                    r={isHovered ? 16 : 13}
                    fill="#1e293b"
                    stroke="#0284c7"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="drop-shadow-lg"
                  />
                  <foreignObject x="-9" y="-9" width="18" height="18">
                    <div className="flex items-center justify-center w-full h-full">
                      {getPoiIcon(poi.icon)}
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            {/* Campsite Pitch Nodes (Numbered interactive circles) */}
            {filteredSites.map((site) => {
              const posX = (site.mapCoordinates.x / 100) * 1000;
              const posY = (site.mapCoordinates.y / 100) * 650;
              const isSelected = selectedSiteId === site.id;
              const isHovered = hoveredSite?.id === site.id;
              const style = getStatusColor(site.status);
              const isRV = site.type.startsWith('rv_');
              const isGlamping = site.type.startsWith('glamping_') || site.type === 'eco_pod';
              const isCabin = site.type === 'waterfront_cabin';

              return (
                <g
                  key={site.id}
                  transform={`translate(${posX}, ${posY})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectSite(site)}
                  onMouseEnter={() => setHoveredSite(site)}
                  onMouseLeave={() => setHoveredSite(null)}
                >
                  {/* Selection pulse ring */}
                  {isSelected && (
                    <circle
                      r="24"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      className="animate-ping"
                      opacity="0.75"
                    />
                  )}

                  {/* Outer shadow / glow on hover */}
                  {(isHovered || isSelected) && (
                    <circle
                      r="22"
                      fill={style.glow}
                      filter="url(#siteGlow)"
                    />
                  )}

                  {/* Base Campsite Node Shape */}
                  {isCabin ? (
                    // Cabin diamond
                    <rect
                      x="-14"
                      y="-14"
                      width="28"
                      height="28"
                      rx="5"
                      transform="rotate(45)"
                      fill={style.fill}
                      stroke={isSelected ? '#ffffff' : style.border}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200"
                    />
                  ) : isGlamping ? (
                    // Glamping Dome hexagon/rounded rect
                    <rect
                      x="-14"
                      y="-14"
                      width="28"
                      height="28"
                      rx="8"
                      fill={style.fill}
                      stroke={isSelected ? '#ffffff' : style.border}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200"
                    />
                  ) : (
                    // RV & Tent Circles
                    <circle
                      r={isHovered || isSelected ? 16 : 14}
                      fill={style.fill}
                      stroke={isSelected ? '#ffffff' : style.border}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200"
                    />
                  )}

                  {/* Site Number Text Label */}
                  <text
                    y="4"
                    fill={site.status === 'reserved' ? '#020617' : '#ffffff'}
                    fontSize={site.number.length > 3 ? "9" : "10"}
                    fontWeight="800"
                    textAnchor="middle"
                    className="font-mono select-none"
                  >
                    {site.number}
                  </text>

                  {/* Tiny Icon indicator on top right */}
                  {site.status === 'occupied' && (
                    <circle cx="11" cy="-11" r="4.5" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                  )}
                  {site.status === 'maintenance_blocked' && (
                    <circle cx="11" cy="-11" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip for Hovered Campsite */}
          {hoveredSite && (
            <div 
              style={{
                left: `${Math.min(85, Math.max(15, hoveredSite.mapCoordinates.x))}%`,
                top: `${hoveredSite.mapCoordinates.y < 35 ? hoveredSite.mapCoordinates.y + 10 : hoveredSite.mapCoordinates.y - 18}%`
              }}
              className="absolute pointer-events-none -translate-x-1/2 z-30 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs w-64 backdrop-blur animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 border border-slate-700">
                    {hoveredSite.number}
                  </span>
                  <span className="truncate">{hoveredSite.name}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(hoveredSite.status).bgClass}`}>
                  {getStatusColor(hoveredSite.status).text}
                </span>
              </div>

              <div className="space-y-1 text-slate-300">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Loop:</span>
                  <span className="font-medium text-slate-200">{hoveredSite.loop}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Power & Hookups:</span>
                  <span className="font-medium text-amber-300">
                    {hoveredSite.hookups.electricAmp}A {hoveredSite.hookups.sewer ? '• Full Sewer' : ''} {hoveredSite.hookups.water ? '• Water' : ''}
                  </span>
                </div>
                {hoveredSite.maxRigLength && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Max Rig Length:</span>
                    <span className="font-medium text-emerald-400">{hoveredSite.maxRigLength} ft ({hoveredSite.hookups.drivewayType})</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 font-semibold">
                  <span className="text-slate-400">Rate:</span>
                  <span className="text-emerald-400">${hoveredSite.currentRatePerNight} / night</span>
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-emerald-400/90 italic">Click site for full specs & booking actions</p>
            </div>
          )}

          {/* Floating Tooltip for Hovered POI */}
          {hoveredPoi && (
            <div 
              style={{
                left: `${hoveredPoi.x}%`,
                top: `${hoveredPoi.y + 7}%`
              }}
              className="absolute pointer-events-none -translate-x-1/2 z-30 bg-slate-900/95 border border-cyan-500/40 rounded-xl p-2.5 shadow-2xl text-xs w-56 backdrop-blur"
            >
              <div className="flex items-center gap-2 font-bold text-cyan-300 text-xs mb-1">
                {getPoiIcon(hoveredPoi.icon)}
                <span>{hoveredPoi.name}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{hoveredPoi.desc}</p>
            </div>
          )}

          {/* Compass Rose Indicator (Top Right) */}
          <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-700/80 rounded-xl p-2 flex flex-col items-center gap-1 shadow-lg backdrop-blur">
            <Compass className="w-6 h-6 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-300 font-mono">N</span>
          </div>

          {/* Live Park Weather Overlay (Bottom Left) */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-3 shadow-lg backdrop-blur text-xs">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/60">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">Emerald Lake Basin</p>
              <p className="text-[11px] text-slate-400">Elevation 2,420 ft • Calm Waters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Map Legend */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Site Status:</span>
          
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Vacant ({stats.vacant})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span>Occupied ({stats.occupied})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Reserved Today ({stats.reserved})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span>Cleaning Needed</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600"></span>
            <span>Maintenance Blocked</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm rotate-45 bg-slate-700 border border-slate-500 inline-block"></span>
            <span>Waterfront Cabin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-700 border border-slate-500 inline-block"></span>
            <span>Glamping Dome</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-500 inline-block"></span>
            <span>RV / Tent Pitch</span>
          </div>
        </div>
      </div>

    </div>
  );
};
