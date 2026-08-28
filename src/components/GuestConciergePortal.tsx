import React, { useState } from 'react';
import { Reservation, AmenityProduct, AmenityOrder, ParkWeather } from '../types';
import { INITIAL_AMENITIES, INITIAL_WEATHER } from '../data/mockCampgroundData';
import { 
  Key, 
  Wifi, 
  Flame, 
  ShoppingBag, 
  Bot, 
  Send, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Sun, 
  PhoneCall, 
  CheckCircle2, 
  Plus, 
  HelpCircle,
  Truck,
  Compass,
  MapPin
} from 'lucide-react';

interface GuestConciergePortalProps {
  currentReservation?: Reservation;
  amenityOrders: AmenityOrder[];
  onPlaceAmenityOrder: (order: AmenityOrder) => void;
  onRequestAssistance: (issueTitle: string, description: string) => void;
}

export const GuestConciergePortal: React.FC<GuestConciergePortalProps> = ({
  currentReservation,
  amenityOrders,
  onPlaceAmenityOrder,
  onRequestAssistance
}) => {
  // Active stay fallback if none selected
  const activeStay = currentReservation || {
    id: 'res-default',
    reservationCode: 'WP-78402',
    guestName: 'Marcus Sterling',
    guestEmail: 'm.sterling@example.com',
    guestPhone: '+1 (555) 345-6789',
    siteId: 'site-l02',
    siteNumber: 'L-02',
    siteType: 'rv_full_hookup' as any,
    checkInDate: '2026-08-25',
    checkOutDate: '2026-08-30',
    nights: 5,
    numGuests: 3,
    numPets: 0,
    numVehicles: 1,
    vehiclePlate: '4KLD901 (WA)',
    rigType: 'Fifth Wheel' as any,
    status: 'checked_in' as any,
    totalAmount: 464,
    paidAmount: 464,
    paymentStatus: 'paid' as any,
    addOns: [],
    gateCode: '4190'
  };

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string; time: string }>>([
    {
      role: 'model',
      text: `Hello ${activeStay.guestName.split(' ')[0]}! I'm Ranger Oakley, your AI camp concierge here at Whispering Pines. How can I make your stay at Site ${activeStay.siteNumber} comfortable today? You can ask me about trail conditions, campfire rules, or request firewood delivered straight to your pitch!`,
      time: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Issue report modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [issueCategory, setIssueCategory] = useState('Electrical Pedestal');
  const [issueDescription, setIssueDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Order state
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  // Send message to Gemini Concierge API
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/gemini/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          guestContext: {
            guestName: activeStay.guestName,
            siteNumber: activeStay.siteNumber,
            rigType: activeStay.rigType
          },
          siteInfo: {
            siteNumber: activeStay.siteNumber,
            loop: 'Lakeside Ridge',
            gateCode: activeStay.gateCode
          }
        })
      });

      const data = await response.json();
      const replyText = data.reply || "I'm right here at the Ranger Station if you need hands-on assistance!";

      setChatMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: "I couldn't reach the park network, but you can dial Front Desk directly at Ext 101.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleQuickOrder = (amenity: AmenityProduct) => {
    const newOrder: AmenityOrder = {
      id: `ord-${Date.now()}`,
      orderCode: `DEL-${Math.floor(8800 + Math.random() * 190)}`,
      amenityId: amenity.id,
      amenityName: amenity.name,
      siteNumber: activeStay.siteNumber,
      guestName: activeStay.guestName,
      quantity: 1,
      totalCost: amenity.price,
      status: 'delivering',
      orderTime: 'Just now',
      estimatedDelivery: '10-15 mins'
    };

    onPlaceAmenityOrder(newOrder);
    setOrderNotification(`Order confirmed! ${amenity.name} is on its way to Site ${activeStay.siteNumber}.`);
    setTimeout(() => setOrderNotification(null), 5000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription) return;

    onRequestAssistance(issueCategory, issueDescription);
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setIsReportOpen(false);
      setIssueDescription('');
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100">
      
      {/* Toast Notification */}
      {orderNotification && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top duration-200">
          <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{orderNotification}</span>
        </div>
      )}

      {/* Top Welcome & Digital Pass Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Digital Keycard & Pass */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE GUEST DIGITAL PASS
              </span>
              <h2 className="text-2xl font-black text-white mt-1.5 tracking-tight">
                Welcome, {activeStay.guestName}
              </h2>
              <p className="text-xs text-slate-300">
                Whispering Pines Holiday Park • Res #{activeStay.reservationCode}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Pitch</span>
              <span className="text-3xl font-black font-mono text-emerald-400 drop-shadow">
                SITE {activeStay.siteNumber}
              </span>
            </div>
          </div>

          {/* Quick Access Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Gate Code */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" /> Gate Access PIN
              </span>
              <span className="text-xl font-black font-mono text-amber-400 tracking-widest mt-1">
                {activeStay.gateCode}
              </span>
            </div>

            {/* Wifi Credentials */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-cyan-400" /> Park High-Speed Wifi
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-1 truncate">
                WhisperingPines_5G
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Pass: happycamper2026</span>
            </div>

            {/* Quiet Hours */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" /> Quiet Hours
              </span>
              <span className="text-xs font-bold text-slate-200 mt-1">
                10:00 PM – 7:00 AM
              </span>
              <span className="text-[10px] text-slate-400">No generators</span>
            </div>

            {/* Check-Out Time */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> Departure Date
              </span>
              <span className="text-xs font-bold text-slate-200 mt-1">
                {activeStay.checkOutDate}
              </span>
              <span className="text-[10px] text-slate-400">Check-out by 11:00 AM</span>
            </div>
          </div>

          {/* Quick Action Button Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Location: Loop A (Lakeside Ridge) • Water, 50A Power & Sewer</span>
            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Report Pitch Issue / Request Help</span>
            </button>
          </div>
        </div>

        {/* Campfire Rules & Live Weather */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-yellow-400" /> Park Conditions
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-bold">
                Fire Danger: Moderate
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-3xl font-black text-white font-mono">74°F</span>
              <div>
                <p className="text-xs font-semibold text-slate-200">{INITIAL_WEATHER.condition}</p>
                <p className="text-[11px] text-slate-400">Wind 6mph • Humidity 48%</p>
              </div>
            </div>
          </div>

          {/* Park Rules Snapshot */}
          <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <p className="font-semibold text-slate-200 text-[11px]">Campfire Advisory:</p>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Metal fire rings only; extinguish fully before sleeping.</li>
              <li>Please keep pets on a 6ft leash at all times.</li>
              <li>Bear-safe trash receptacles at loop entry.</li>
            </ul>
          </div>

          <a
            href="tel:+15550192831"
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call Ranger Station (Ext 101)</span>
          </a>
        </div>

      </div>

      {/* Main Bottom Section: 1-Click Pitch Deliveries + AI Park Ranger Concierge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): 1-Click Pitch Delivery Menu */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" /> Direct-to-Pitch Delivery
              </h3>
              <p className="text-xs text-slate-400">Delivered directly to Site {activeStay.siteNumber}</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Avg 12 min
            </span>
          </div>

          <div className="space-y-2.5">
            {INITIAL_AMENITIES.map((amenity) => (
              <div 
                key={amenity.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-md group"
              >
                <div className="truncate pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-100">{amenity.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{amenity.description}</p>
                  <p className="text-xs font-black text-emerald-400 font-mono mt-1">
                    ${amenity.price} <span className="text-[10px] text-slate-500 font-normal">{amenity.priceUnit}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleQuickOrder(amenity)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-sm transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Order</span>
                </button>
              </div>
            ))}
          </div>

          {/* Active Orders Status Tracking */}
          {amenityOrders.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-400" /> Active Deliveries
              </h4>
              
              <div className="space-y-2">
                {amenityOrders.map((ord) => (
                  <div key={ord.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{ord.amenityName}</p>
                      <p className="text-[10px] text-slate-400">Pitch {ord.siteNumber} • {ord.orderTime}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === 'delivering' ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {ord.status === 'delivering' ? `En Route (${ord.estimatedDelivery})` : 'Delivered'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): AI Park Ranger Oakley Concierge */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[560px] overflow-hidden">
          
          {/* AI Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Ranger Oakley</h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI Park Concierge
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Ask about trails, boat rentals, stargazing & park rules</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Online</span>
            </div>
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="p-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
            <span className="text-slate-500 font-medium whitespace-nowrap pl-1">Ask:</span>
            {[
              "Are campfires allowed tonight?",
              "What are the best hiking trails nearby?",
              "Can I book the lakefront sauna?",
              "What are the fishing limits on Emerald Lake?",
              "Can I get a late checkout tomorrow?"
            ].map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 whitespace-nowrap border border-slate-700/80 transition-colors"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {chatMessages.map((msg, index) => {
              const isMe = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-950/40'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <span className={`block text-[9px] mt-1.5 ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700/80 rounded-2xl rounded-bl-none p-3 text-xs text-slate-400 flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>Ranger Oakley is typing guidance...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask Ranger Oakley anything about the park or your site..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isAiTyping}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

      {/* Report Issue Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Report Pitch Maintenance
              </h3>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-950/60 rounded-xl border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm text-white">Ticket Dispatched!</p>
                <p className="text-xs text-slate-300">
                  Maintenance crew has been notified for Site {activeStay.siteNumber}. A ranger is on the way.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Issue Category</label>
                  <select
                    value={issueCategory}
                    onChange={e => setIssueCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="Electrical Pedestal">Electrical Pedestal / Power Trip</option>
                    <option value="Plumbing / Water">Water Spigot / Hose Connection</option>
                    <option value="Cabin Housekeeping">Cabin Towels / Supplies</option>
                    <option value="Tree / Grounds">Branch / Campfire Ring</option>
                    <option value="Quiet Hours / Noise">Quiet Hours Disturbance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Breaker tripped on 30A plug when turning on AC..."
                    value={issueDescription}
                    onChange={e => setIssueDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40"
                  >
                    Submit Work Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
