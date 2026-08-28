import React from 'react';
import { 
  Compass, 
  CalendarDays, 
  UserCheck, 
  Smartphone, 
  Wrench, 
  TrendingUp, 
  Search, 
  Plus, 
  Flame, 
  Sun, 
  Bell, 
  Tent,
  Sparkles
} from 'lucide-react';
import { AppViewMode, ParkMetrics, ParkWeather } from '../types';

interface NavbarProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  metrics: ParkMetrics;
  weather: ParkWeather;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewBooking: () => void;
  onOpenBroadcastModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  metrics,
  weather,
  searchQuery,
  onSearchChange,
  onOpenNewBooking,
  onOpenBroadcastModal
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Bar: Brand, Search, Key Operational KPIs, and Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Park Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('map_overview')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600/90 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-emerald-500/30">
              <Tent className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Whispering Pines</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  Holiday Park & Resort
                </span>
              </div>
              <p className="text-xs text-slate-400">Executive Operations & Guest OS</p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search site, guest, plate, booking #..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-200"
              >
                ×
              </button>
            )}
          </div>

          {/* Park Status Indicators: Weather, Fire Danger, Occupancy */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            {/* Live Weather Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{weather.temperatureF}°F • {weather.condition}</span>
            </div>

            {/* Fire Danger Level */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Fire Danger: <strong>{weather.fireDanger}</strong></span>
            </div>

            {/* Occupancy Indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span><strong>{metrics.occupancyRate}%</strong> Occupied ({metrics.occupiedSites}/{metrics.totalSites})</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBroadcastModal}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Compose Park Broadcast"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>

            <button
              onClick={onOpenNewBooking}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all shadow-emerald-900/40 hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Reservation</span>
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          <button
            onClick={() => onViewChange('map_overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              currentView === 'map_overview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Park Map</span>
          </button>

          <button
            onClick={() => onViewChange('reservation_gantt')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              currentView === 'reservation_gantt'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Reservation Grid</span>
          </button>

          <button
            onClick={() => onViewChange('check_in_desk')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              currentView === 'check_in_desk'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Front Desk & Check-In</span>
            {metrics.checkInsPendingToday > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                {metrics.checkInsPendingToday}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange('guest_concierge')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              currentView === 'guest_concierge'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Camper Digital Concierge</span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-indigo-900/80 text-indigo-200 border border-indigo-700/50">
              Guest View
            </span>
          </button>

          <button
            onClick={() => onViewChange('maintenance_dispatch')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              currentView === 'maintenance_dispatch'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Maintenance & Dispatch</span>
            {metrics.cleaningNeeded + metrics.maintenanceBlocked > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500/80 text-white font-bold text-[10px]">
                {metrics.cleaningNeeded + metrics.maintenanceBlocked}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange('revenue_optimizer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              currentView === 'revenue_optimizer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>AI Revenue & Dynamic Rates</span>
            <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-amber-400 text-slate-950 flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
