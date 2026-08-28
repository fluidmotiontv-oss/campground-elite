import React, { useState } from 'react';
import { 
  Campsite, 
  Reservation, 
  SiteStatus 
} from '../types';
import { 
  X, 
  Zap, 
  Droplet, 
  Trash2, 
  Flame, 
  Wifi, 
  Sun, 
  Truck, 
  Users, 
  Dog, 
  Calendar, 
  Key, 
  Phone, 
  Mail, 
  CheckCircle, 
  LogOut, 
  Wrench, 
  Sparkles, 
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface SiteDetailDrawerProps {
  site: Campsite | null;
  currentReservation?: Reservation;
  onClose: () => void;
  onCheckInGuest?: (reservationId: string) => void;
  onCheckOutGuest?: (reservationId: string, siteId: string) => void;
  onNewBooking?: (site: Campsite) => void;
  onUpdateSiteStatus?: (siteId: string, newStatus: SiteStatus) => void;
  onOpenWorkOrderModal?: (site: Campsite) => void;
}

export const SiteDetailDrawer: React.FC<SiteDetailDrawerProps> = ({
  site,
  currentReservation,
  onClose,
  onCheckInGuest,
  onCheckOutGuest,
  onNewBooking,
  onUpdateSiteStatus,
  onOpenWorkOrderModal
}) => {
  const [editingPrice, setEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(site?.currentRatePerNight || 0);

  if (!site) return null;

  const getStatusBadge = (status: SiteStatus) => {
    switch (status) {
      case 'vacant':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Vacant & Ready</span>;
      case 'occupied':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">Occupied (In-House)</span>;
      case 'reserved':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Reserved Today</span>;
      case 'cleaning_needed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">Housekeeping Needed</span>;
      case 'maintenance_blocked':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">Blocked / Under Maintenance</span>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col text-slate-100 overflow-hidden animate-in slide-in-from-right duration-250">
      
      {/* Header with Site Photo & Close Button */}
      <div className="relative h-48 bg-slate-950 overflow-hidden border-b border-slate-800 shrink-0">
        <img 
          src={site.imageUrl} 
          alt={site.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Site Badge & Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md font-bold bg-emerald-500 text-slate-950 shadow-md">
              SITE {site.number}
            </span>
            {getStatusBadge(site.status)}
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{site.name}</h2>
          <p className="text-xs text-slate-300">{site.loop} • {site.hookups.drivewayType} ({site.hookups.padSurface})</p>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Rate & Quick Pricing */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Current Nightly Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400">${site.currentRatePerNight}</span>
              <span className="text-xs text-slate-400">/ night</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {site.status === 'vacant' && (
              <button
                onClick={() => onNewBooking?.(site)}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Book Site</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Guest / Reservation Card */}
        {currentReservation ? (
          <div className="p-4 rounded-xl bg-slate-800/90 border border-indigo-500/40 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center border border-indigo-500/40">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{currentReservation.guestName}</h3>
                  <p className="text-xs text-slate-400 font-mono">Res #{currentReservation.reservationCode}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                currentReservation.status === 'checked_in' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {currentReservation.status === 'checked_in' ? 'Checked In' : 'Arriving Today'}
              </span>
            </div>

            {/* Guest Stay Dates & Rig Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">Dates ({currentReservation.nights} nights)</span>
                <p className="font-medium text-slate-200">{currentReservation.checkInDate} → {currentReservation.checkOutDate}</p>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">Gate Access Code</span>
                <p className="font-mono font-bold text-amber-400 text-sm tracking-wider">{currentReservation.gateCode}</p>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">Vehicle / Rig</span>
                <p className="font-medium text-slate-200">{currentReservation.rigType || 'Vehicle'} ({currentReservation.vehiclePlate})</p>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">Total Paid</span>
                <p className="font-bold text-emerald-400">${currentReservation.paidAmount}</p>
              </div>
            </div>

            {/* Guest Contact Actions */}
            <div className="flex items-center gap-2 pt-1">
              <a 
                href={`tel:${currentReservation.guestPhone}`}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Guest</span>
              </a>
              <a 
                href={`mailto:${currentReservation.guestEmail}`}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Pass</span>
              </a>
            </div>

            {/* Check-In / Check-Out Action Buttons */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2">
              {currentReservation.status === 'confirmed' && (
                <button
                  onClick={() => onCheckInGuest?.(currentReservation.id)}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Execute Check-In & Grant Gate Access</span>
                </button>
              )}

              {currentReservation.status === 'checked_in' && (
                <button
                  onClick={() => onCheckOutGuest?.(currentReservation.id, site.id)}
                  className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-orange-400" />
                  <span>Check-Out Guest (Mark Cleaning Needed)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 text-center text-xs text-slate-400 space-y-2">
            <p>No active reservation on this site right now.</p>
            {site.nextCheckIn && (
              <p className="text-amber-400 font-medium">Next Incoming: {site.nextCheckIn}</p>
            )}
          </div>
        )}

        {/* Campsite Specifications & Hookup Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Site Infrastructure & Amenities</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            
            {/* Electrical Pedestal */}
            <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-center gap-2.5">
              <Zap className={`w-4 h-4 ${site.hookups.electricAmp > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-[10px] text-slate-400 block">Electrical Power</span>
                <span className="font-semibold text-slate-200">{site.hookups.electricAmp} Amp Pedestal</span>
              </div>
            </div>

            {/* Fresh Potable Water */}
            <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-center gap-2.5">
              <Droplet className={`w-4 h-4 ${site.hookups.water ? 'text-cyan-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-[10px] text-slate-400 block">Potable Water</span>
                <span className="font-semibold text-slate-200">{site.hookups.water ? 'Direct City Water' : 'No Water Hookup'}</span>
              </div>
            </div>

            {/* Full Sewer Hookup */}
            <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-center gap-2.5">
              <Trash2 className={`w-4 h-4 ${site.hookups.sewer ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-[10px] text-slate-400 block">Sewer Drop</span>
                <span className="font-semibold text-slate-200">{site.hookups.sewer ? 'Full In-Ground Port' : 'Sanidump Station'}</span>
              </div>
            </div>

            {/* Fire Ring & Table */}
            <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Campfire Ring</span>
                <span className="font-semibold text-slate-200">{site.hookups.firePit ? 'Steel Grated Hearth' : 'No Open Fire'}</span>
              </div>
            </div>

            {/* Wifi Coverage */}
            <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Park Wifi Signal</span>
                <span className="font-semibold text-slate-200">{site.hookups.wifiStrength}</span>
              </div>
            </div>

            {/* Tree Shade */}
            <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-yellow-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Shade Coverage</span>
                <span className="font-semibold text-slate-200">{site.hookups.shadeRating}</span>
              </div>
            </div>

            {/* Max Rig Clearance */}
            <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Max Rig Clearance</span>
                <span className="font-semibold text-slate-200">{site.maxRigLength ? `${site.maxRigLength} ft Rig` : 'Tent / Non-RV'}</span>
              </div>
            </div>

            {/* Pets Allowed */}
            <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-center gap-2.5">
              <Dog className={`w-4 h-4 ${site.petFriendly ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-[10px] text-slate-400 block">Pet Friendly</span>
                <span className="font-semibold text-slate-200">{site.petFriendly ? 'Yes (Leash Policy)' : 'No Pets Allowed'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Site Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Site Description</h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            {site.description}
          </p>
        </div>

        {/* Operational Controls: Flag Maintenance & Quick Status Toggle */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Park Operations Controls</h4>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenWorkOrderModal?.(site)}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Maintenance Ticket</span>
            </button>

            {site.status !== 'maintenance_blocked' ? (
              <button
                onClick={() => onUpdateSiteStatus?.(site.id, 'maintenance_blocked')}
                className="py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-xs font-medium text-rose-300 transition-colors"
              >
                Block Site
              </button>
            ) : (
              <button
                onClick={() => onUpdateSiteStatus?.(site.id, 'vacant')}
                className="py-2 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-xs font-medium text-emerald-300 transition-colors"
              >
                Unblock & Set Vacant
              </button>
            )}

            {site.status === 'cleaning_needed' && (
              <button
                onClick={() => onUpdateSiteStatus?.(site.id, 'vacant')}
                className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm transition-colors"
              >
                Mark Cleaned
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Campsite #{site.number} ({site.loop})</span>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
