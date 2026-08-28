import React, { useState, useMemo } from 'react';
import { Campsite, Reservation, ReservationAddOn, SiteType } from '../types';
import { INITIAL_AMENITIES } from '../data/mockCampgroundData';
import { 
  X, 
  Check, 
  Calendar, 
  User, 
  Truck, 
  Tent, 
  Sparkles, 
  Plus, 
  Minus, 
  CreditCard, 
  ShieldCheck, 
  Key, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Campsite[];
  preSelectedSiteId?: string | null;
  preSelectedDate?: string | null;
  onConfirmBooking: (newReservation: Reservation) => void;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  sites,
  preSelectedSiteId,
  preSelectedDate,
  onConfirmBooking
}) => {
  // Form State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [numGuests, setNumGuests] = useState(2);
  const [numPets, setNumPets] = useState(0);
  const [numVehicles, setNumVehicles] = useState(1);

  // Rig / Camping Preference
  const [rigType, setRigType] = useState<any>('Class A Motorhome');
  const [rigLength, setRigLength] = useState<number>(38);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(preSelectedSiteId || sites[0]?.id || '');
  
  // Dates
  const [checkInDate, setCheckInDate] = useState(preSelectedDate || '2026-08-25');
  const [checkOutDate, setCheckOutDate] = useState('2026-08-28');
  
  // Add-ons selected
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({
    'amen-1': 2 // default 2 bundles of firewood
  });

  const [specialRequests, setSpecialRequests] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedRes, setConfirmedRes] = useState<Reservation | null>(null);

  // Calculate nights
  const nights = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
  }, [checkInDate, checkOutDate]);

  // Selected site object
  const currentSite = useMemo(() => {
    return sites.find(s => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  // Filter sites compatible with selected rig
  const compatibleSites = useMemo(() => {
    return sites.filter((site) => {
      if (rigType === 'Cabin Stay') return site.type === 'waterfront_cabin' || site.type.startsWith('glamping_') || site.type === 'eco_pod';
      if (rigType === 'Ground Tent' || rigType === 'Roof Tent') return site.type.startsWith('tent_') || site.type === 'rv_electric_water';
      if (site.type.startsWith('rv_')) {
        if (site.maxRigLength && rigLength && site.maxRigLength < rigLength) return false;
        return true;
      }
      return true;
    });
  }, [sites, rigType, rigLength]);

  // Pricing calculation
  const baseTotal = (currentSite?.currentRatePerNight || 75) * nights;
  
  const addOnsTotal = useMemo(() => {
    let sum = 0;
    for (const [amenId, rawQty] of Object.entries(selectedAddOns)) {
      const qty = Number(rawQty) || 0;
      if (qty > 0) {
        const item = INITIAL_AMENITIES.find(a => a.id === amenId);
        if (item) sum += item.price * qty;
      }
    }
    if (numPets > 0) sum += numPets * 15; // pet fee
    return sum;
  }, [selectedAddOns, numPets]);

  const tax = Math.round((baseTotal + addOnsTotal) * 0.08);
  const grandTotal = baseTotal + addOnsTotal + tax;

  const handleToggleAddOn = (amenId: string, delta: number) => {
    setSelectedAddOns(prev => {
      const current = prev[amenId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [amenId]: next };
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail) return;

    // Generate 4-digit gate code
    const generatedGateCode = Math.floor(1000 + Math.random() * 9000).toString();
    const generatedCode = `WP-${Math.floor(78420 + Math.random() * 800)}`;

    const addOnList: ReservationAddOn[] = [];
    for (const [amenId, rawQty] of Object.entries(selectedAddOns)) {
      const qty = Number(rawQty) || 0;
      if (qty > 0) {
        const item = INITIAL_AMENITIES.find(a => a.id === amenId);
        if (item) {
          addOnList.push({
            id: item.id,
            name: `${item.name} (${qty}x)`,
            price: item.price * qty,
            quantity: qty,
            category: 'gear'
          });
        }
      }
    }

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      reservationCode: generatedCode,
      guestName,
      guestEmail,
      guestPhone: guestPhone || '+1 (555) 019-2831',
      siteId: currentSite.id,
      siteNumber: currentSite.number,
      siteType: currentSite.type,
      checkInDate,
      checkOutDate,
      nights,
      numGuests,
      numPets,
      numVehicles,
      vehiclePlate: vehiclePlate || 'PENDING-01',
      rigType,
      rigLength: rigLength || undefined,
      status: 'confirmed',
      totalAmount: grandTotal,
      paidAmount: grandTotal,
      paymentStatus: 'paid',
      addOns: addOnList,
      specialRequests,
      gateCode: generatedGateCode
    };

    onConfirmBooking(newRes);
    setConfirmedRes(newRes);
    setIsSuccess(true);

    // Launch confetti celebration
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Reservation</h2>
              <p className="text-xs text-slate-400">Whispering Pines Holiday Park Booking Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess && confirmedRes ? (
          /* Confirmation Success Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Reservation Confirmed!</h3>
              <p className="text-xs text-slate-300">
                Booking Reference: <strong className="font-mono text-emerald-400">{confirmedRes.reservationCode}</strong>
              </p>
            </div>

            {/* Access Pass Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 max-w-md mx-auto text-left space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-bold text-sm text-white">{confirmedRes.guestName}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  SITE {confirmedRes.siteNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Stay Dates</span>
                  <span className="font-medium text-slate-200">{confirmedRes.checkInDate} to {confirmedRes.checkOutDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Gate Access Code</span>
                  <span className="font-mono text-base font-bold text-amber-400 tracking-widest">{confirmedRes.gateCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Rig / Vehicle</span>
                  <span className="font-medium text-slate-200">{confirmedRes.rigType} ({confirmedRes.vehiclePlate})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Paid</span>
                  <span className="font-bold text-emerald-400">${confirmedRes.paidAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 transition-colors"
              >
                Done & Return to Map
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
            
            {/* Step 1: Guest Contact */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 1. Guest Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Full Guest Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Katherine Pierce"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="katherine@example.com"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Guests (#)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={numGuests}
                    onChange={e => setNumGuests(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Pets ($15 fee)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={numPets}
                    onChange={e => setNumPets(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Vehicles</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={numVehicles}
                    onChange={e => setNumVehicles(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">License Plate</label>
                  <input
                    type="text"
                    placeholder="e.g. 7XYZ89 (WA)"
                    value={vehiclePlate}
                    onChange={e => setVehiclePlate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Rig Setup & Compatible Campsite Matcher */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> 2. Rig Profile & Site Matcher
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Rig / Stay Type</label>
                  <select
                    value={rigType}
                    onChange={e => setRigType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Class A Motorhome">Class A Motorhome (Big Rig)</option>
                    <option value="Fifth Wheel">Fifth Wheel</option>
                    <option value="Travel Trailer">Travel Trailer</option>
                    <option value="Class C Motorhome">Class C Motorhome</option>
                    <option value="Campervan">Campervan / Sprinter</option>
                    <option value="Ground Tent">Ground Tent Camping</option>
                    <option value="Roof Tent">Roof Tent / Overland</option>
                    <option value="Cabin Stay">Glamping / Luxury Cabin Stay</option>
                  </select>
                </div>

                {rigType !== 'Cabin Stay' && !rigType.includes('Tent') && (
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Rig Length (ft)</label>
                    <input
                      type="number"
                      min="15"
                      max="45"
                      value={rigLength}
                      onChange={e => setRigLength(parseInt(e.target.value) || 25)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Select Pitch ({compatibleSites.length} matched)</label>
                  <select
                    value={selectedSiteId}
                    onChange={e => setSelectedSiteId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  >
                    {compatibleSites.map(s => (
                      <option key={s.id} value={s.id}>
                        Site {s.number} - {s.name} (${s.currentRatePerNight}/nt)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-400" /> Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={e => setCheckInDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-400" /> Check-out Date ({nights} nights)
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={e => setCheckOutDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Add-on Amenities */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 3. Add-On Gear & Experiences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {INITIAL_AMENITIES.slice(0, 4).map((amen) => {
                  const qty = selectedAddOns[amen.id] || 0;
                  return (
                    <div key={amen.id} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <p className="font-semibold text-slate-200 truncate">{amen.name}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">${amen.price} {amen.priceUnit}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleAddOn(amen.id, -1)}
                          disabled={qty === 0}
                          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-200 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs w-4 text-center font-mono">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleAddOn(amen.id, 1)}
                          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Itemized Total & Submit */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{nights} Nights @ ${currentSite?.currentRatePerNight}/night</span>
                <span className="font-mono">${baseTotal}</span>
              </div>
              {addOnsTotal > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Add-ons & Equipment</span>
                  <span className="font-mono">${addOnsTotal}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Resort Park Tax & Conservation (8%)</span>
                <span className="font-mono">${tax}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Due & Paid</span>
                <span className="text-base font-black text-emerald-400 font-mono">${grandTotal}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Generate Digital Gate Pass</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
