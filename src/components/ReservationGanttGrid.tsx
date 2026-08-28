import React, { useState, useMemo } from 'react';
import { Campsite, Reservation, SiteType, ParkLoop } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  User, 
  Truck, 
  Tent, 
  Sparkles,
  Info
} from 'lucide-react';

interface ReservationGanttGridProps {
  sites: Campsite[];
  reservations: Reservation[];
  onSelectSite: (site: Campsite) => void;
  onOpenNewBookingWithSlot?: (siteId: string, startDate: string) => void;
}

export const ReservationGanttGrid: React.FC<ReservationGanttGridProps> = ({
  sites,
  reservations,
  onSelectSite,
  onOpenNewBookingWithSlot
}) => {
  // 14-day timeline window starting from Aug 23, 2026
  const [startDateOffset, setStartDateOffset] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedLoop, setSelectedLoop] = useState<ParkLoop | 'ALL'>('ALL');

  // Base reference date (August 23, 2026)
  const baseDate = new Date(2026, 7, 23); // month is 0-indexed (7 = Aug)
  
  // Generate 12 consecutive days
  const dateColumns = useMemo(() => {
    const days = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + startDateOffset + i);
      const iso = d.toISOString().split('T')[0];
      const isToday = iso === '2026-08-25'; // Simulated today
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({ date: d, iso, dayName, dayNumber, monthName, isToday });
    }
    return days;
  }, [startDateOffset]);

  // Filtered sites
  const visibleSites = useMemo(() => {
    return sites.filter((site) => {
      if (selectedLoop !== 'ALL' && site.loop !== selectedLoop) return false;
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        return site.number.toLowerCase().includes(q) || site.name.toLowerCase().includes(q) || site.loop.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sites, selectedLoop, searchFilter]);

  // Map reservations to site IDs
  const reservationsBySite = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const res of reservations) {
      if (res.status === 'cancelled') continue;
      const list = map.get(res.siteId) || [];
      list.push(res);
      map.set(res.siteId, list);
    }
    return map;
  }, [reservations]);

  const getSiteTypeIcon = (type: SiteType) => {
    if (type.startsWith('rv_')) return <Truck className="w-3.5 h-3.5 text-blue-400" />;
    if (type.startsWith('glamping_') || type === 'eco_pod') return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    if (type === 'waterfront_cabin') return <span className="text-xs">🏡</span>;
    return <Tent className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 shadow-sm">
        
        {/* Navigation & Date Range Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setStartDateOffset(prev => prev - 7)}
              className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Previous 7 Days"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStartDateOffset(0)}
              className="px-2.5 py-1 text-xs font-semibold hover:bg-slate-700 text-slate-200 border-x border-slate-700"
            >
              Today
            </button>
            <button
              onClick={() => setStartDateOffset(prev => prev + 7)}
              className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Next 7 Days"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-medium text-slate-300 ml-1">
            {dateColumns[0].monthName} {dateColumns[0].dayNumber} – {dateColumns[dateColumns.length - 1].monthName} {dateColumns[dateColumns.length - 1].dayNumber}, 2026
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 text-xs">
          {/* Loop Selector */}
          <select
            value={selectedLoop}
            onChange={(e) => setSelectedLoop(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Loops (28 Sites)</option>
            <option value="Lakeside Ridge">Lakeside Ridge</option>
            <option value="Pine Forest Haven">Pine Forest Haven</option>
            <option value="Meadowbrook Loop">Meadowbrook Loop</option>
            <option value="Canyon Creek">Canyon Creek</option>
          </select>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Filter site #..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-200 w-32 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Gantt Timeline Table Container */}
      <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-6">
        <div className="min-w-[960px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          
          {/* Header Row: Sites Column + Date Columns */}
          <div className="grid grid-cols-[220px_repeat(12,_minmax(60px,_1fr))] border-b border-slate-800 bg-slate-950 sticky top-0 z-10">
            
            {/* Site Column Header */}
            <div className="p-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-800 flex items-center justify-between">
              <span>Campsite / Pitch</span>
              <span className="text-[10px] text-slate-500">Rate</span>
            </div>

            {/* Date Column Headers */}
            {dateColumns.map((col) => (
              <div
                key={col.iso}
                className={`p-2 text-center border-r border-slate-800/80 flex flex-col items-center justify-center ${
                  col.isToday ? 'bg-emerald-950/40 border-b-2 border-b-emerald-400' : ''
                }`}
              >
                <span className="text-[10px] font-medium text-slate-400 uppercase">{col.dayName}</span>
                <span className={`text-sm font-bold font-mono ${col.isToday ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {col.dayNumber}
                </span>
                {col.isToday && (
                  <span className="text-[9px] font-bold text-emerald-300 uppercase mt-0.5 px-1 rounded bg-emerald-900/60">
                    Today
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Site Rows with Reservation Bars */}
          <div className="divide-y divide-slate-800/60">
            {visibleSites.map((site) => {
              const siteReservations = reservationsBySite.get(site.id) || [];

              return (
                <div
                  key={site.id}
                  className="grid grid-cols-[220px_repeat(12,_minmax(60px,_1fr))] hover:bg-slate-850/40 transition-colors group relative"
                >
                  {/* Site Info Cell */}
                  <div 
                    onClick={() => onSelectSite(site)}
                    className="p-2.5 px-3.5 border-r border-slate-800 flex items-center justify-between bg-slate-900/90 cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        {site.number}
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-200 truncate">{site.name}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          {getSiteTypeIcon(site.type)}
                          <span className="truncate">{site.hookups.electricAmp}A • {site.hookups.drivewayType}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 font-mono ml-2 shrink-0">
                      ${site.currentRatePerNight}
                    </span>
                  </div>

                  {/* 12 Day Grid Cells */}
                  {dateColumns.map((col, colIndex) => {
                    // Check if a reservation starts or covers this date
                    const activeRes = siteReservations.find(res => {
                      return col.iso >= res.checkInDate && col.iso < res.checkOutDate;
                    });

                    const isCheckInDay = activeRes && activeRes.checkInDate === col.iso;
                    const isCheckOutDay = activeRes && activeRes.checkOutDate === col.iso;

                    return (
                      <div
                        key={col.iso}
                        onClick={() => {
                          if (activeRes) {
                            onSelectSite(site);
                          } else {
                            onOpenNewBookingWithSlot?.(site.id, col.iso);
                          }
                        }}
                        className={`h-12 border-r border-slate-800/60 relative flex items-center justify-center p-0.5 cursor-pointer transition-colors ${
                          col.isToday ? 'bg-emerald-950/15' : ''
                        } ${!activeRes ? 'hover:bg-slate-800/50' : ''}`}
                      >
                        {/* If reservation is on this day */}
                        {activeRes && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSite(site);
                            }}
                            className={`w-full h-8 rounded-md px-1.5 flex items-center gap-1 text-[11px] font-medium shadow-sm transition-all truncate select-none ${
                              activeRes.status === 'checked_in'
                                ? 'bg-blue-600/90 text-white hover:bg-blue-500 border border-blue-400/30'
                                : 'bg-amber-600/90 text-slate-950 font-bold hover:bg-amber-500 border border-amber-400/30'
                            }`}
                            title={`${activeRes.guestName} (${activeRes.checkInDate} to ${activeRes.checkOutDate}) - ${activeRes.status}`}
                          >
                            {isCheckInDay && (
                              <User className="w-3 h-3 shrink-0 opacity-80" />
                            )}
                            <span className="truncate">
                              {isCheckInDay ? activeRes.guestName.split(' ')[0] : '•'}
                            </span>
                          </div>
                        )}

                        {/* Empty slot subtle plus on hover */}
                        {!activeRes && (
                          <span className="opacity-0 group-hover:opacity-30 hover:opacity-100 text-slate-500 hover:text-emerald-400 text-xs transition-opacity">
                            +
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-600"></div>
              <span>Checked-In Guest</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500"></div>
              <span>Confirmed / Arriving Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></div>
              <span>Available for Direct Booking</span>
            </div>
          </div>
          <span className="italic">Click any reservation bar to inspect details, or click an empty day to create a booking.</span>
        </div>

      </div>

    </div>
  );
};
