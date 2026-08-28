import React, { useState, useMemo } from 'react';
import { 
  AppViewMode, 
  Campsite, 
  Reservation, 
  IncidentWorkOrder, 
  ParkBroadcast, 
  ParkMetrics, 
  ParkWeather,
  AmenityOrder,
  SiteStatus
} from './types';
import { 
  INITIAL_CAMPSITES, 
  INITIAL_RESERVATIONS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_BROADCASTS, 
  INITIAL_METRICS, 
  INITIAL_WEATHER,
  INITIAL_AMENITIES
} from './data/mockCampgroundData';
import { Navbar } from './components/Navbar';
import { InteractiveParkMap } from './components/InteractiveParkMap';
import { ReservationGanttGrid } from './components/ReservationGanttGrid';
import { GuestConciergePortal } from './components/GuestConciergePortal';
import { MaintenanceDispatch } from './components/MaintenanceDispatch';
import { RevenueOptimizer } from './components/RevenueOptimizer';
import { BroadcastCenter } from './components/BroadcastCenter';
import { SiteDetailDrawer } from './components/SiteDetailDrawer';
import { NewReservationModal } from './components/NewReservationModal';
import { AlertTriangle, X, Radio, Bell } from 'lucide-react';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<AppViewMode>('map');

  // Core State
  const [sites, setSites] = useState<Campsite[]>(INITIAL_CAMPSITES);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [workOrders, setWorkOrders] = useState<IncidentWorkOrder[]>(INITIAL_WORK_ORDERS);
  const [broadcasts, setBroadcasts] = useState<ParkBroadcast[]>(INITIAL_BROADCASTS);
  const [metrics, setMetrics] = useState<ParkMetrics>(INITIAL_METRICS);
  const [weather, setWeather] = useState<ParkWeather>(INITIAL_WEATHER);
  const [amenityOrders, setAmenityOrders] = useState<AmenityOrder[]>([
    {
      id: 'ord-1',
      orderCode: 'DEL-8841',
      amenityId: 'amen-1',
      amenityName: 'Kiln-Dried Hardwood Firewood (2x)',
      siteNumber: 'L-02',
      guestName: 'Marcus Sterling',
      quantity: 2,
      totalCost: 24,
      status: 'delivering',
      orderTime: '8 mins ago',
      estimatedDelivery: '5 mins'
    }
  ]);

  // Selected Site & Drawer state
  const [selectedSite, setSelectedSite] = useState<Campsite | null>(null);

  // New Reservation Modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalSiteId, setBookingModalSiteId] = useState<string | null>(null);
  const [bookingModalDate, setBookingModalDate] = useState<string | null>(null);

  // Active Broadcast Banner dismissal
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Find active emergency / warning broadcast
  const activeAlert = useMemo(() => {
    return broadcasts.find(b => b.active && (b.priority === 'emergency' || b.priority === 'warning' || b.priority === 'advisory'));
  }, [broadcasts]);

  // Current reservation for selected site
  const currentReservationForSelectedSite = useMemo(() => {
    if (!selectedSite) return undefined;
    return reservations.find(r => r.siteId === selectedSite.id && r.status !== 'cancelled');
  }, [selectedSite, reservations]);

  // Handlers
  const handleSelectSite = (site: Campsite) => {
    setSelectedSite(site);
  };

  const handleCloseSiteDrawer = () => {
    setSelectedSite(null);
  };

  // Open booking modal
  const handleOpenBookingModal = (preSiteId?: string, preDate?: string) => {
    setBookingModalSiteId(preSiteId || null);
    setBookingModalDate(preDate || null);
    setIsBookingModalOpen(true);
  };

  // Confirm new booking
  const handleConfirmBooking = (newRes: Reservation) => {
    setReservations(prev => [newRes, ...prev]);
    
    // Update site status to reserved or occupied if checkin is today
    setSites(prev => prev.map(s => {
      if (s.id === newRes.siteId) {
        return {
          ...s,
          status: newRes.checkInDate === '2026-08-25' ? 'reserved' : s.status,
          currentReservationId: newRes.id
        };
      }
      return s;
    }));

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      monthlyRevenue: prev.monthlyRevenue + newRes.totalAmount,
      totalActiveReservations: prev.totalActiveReservations + 1
    }));
  };

  // Guest Check-In
  const handleCheckInGuest = (reservationId: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return { ...r, status: 'checked_in' };
      }
      return r;
    }));

    // Find the reservation to get siteId
    const res = reservations.find(r => r.id === reservationId);
    if (res) {
      setSites(prev => prev.map(s => {
        if (s.id === res.siteId) {
          const updatedSite = { ...s, status: 'occupied' as SiteStatus };
          if (selectedSite?.id === s.id) setSelectedSite(updatedSite);
          return updatedSite;
        }
        return s;
      }));
    }
  };

  // Guest Check-Out
  const handleCheckOutGuest = (reservationId: string, siteId: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return { ...r, status: 'checked_out' };
      }
      return r;
    }));

    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        const updatedSite = { ...s, status: 'cleaning_needed' as SiteStatus, currentReservationId: undefined };
        if (selectedSite?.id === s.id) setSelectedSite(updatedSite);
        return updatedSite;
      }
      return s;
    }));
  };

  // Update Site Status (e.g. Block / Vacant / Cleaned)
  const handleUpdateSiteStatus = (siteId: string, newStatus: SiteStatus) => {
    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        const updatedSite = { ...s, status: newStatus };
        if (selectedSite?.id === s.id) setSelectedSite(updatedSite);
        return updatedSite;
      }
      return s;
    }));
  };

  // Apply Dynamic Pricing
  const handleApplyDynamicPricing = (siteAdjustments: Array<{ siteId: string; newRate: number }>) => {
    const rateMap = new Map(siteAdjustments.map(a => [a.siteId, a.newRate]));
    setSites(prev => prev.map(s => {
      if (rateMap.has(s.id)) {
        return { ...s, currentRatePerNight: rateMap.get(s.id)! };
      }
      return s;
    }));
  };

  // Work Order Status Change
  const handleUpdateWorkOrderStatus = (id: string, newStatus: 'open' | 'in_progress' | 'resolved', notes?: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        return {
          ...wo,
          status: newStatus,
          resolutionNotes: notes || wo.resolutionNotes
        };
      }
      return wo;
    }));
  };

  // Create Work Order
  const handleCreateWorkOrder = (order: IncidentWorkOrder) => {
    setWorkOrders(prev => [order, ...prev]);
  };

  // Send Broadcast
  const handleSendBroadcast = (broadcast: ParkBroadcast) => {
    setBroadcasts(prev => [broadcast, ...prev]);
    setBannerDismissed(false);
  };

  // Concierge: Order Amenity
  const handlePlaceAmenityOrder = (order: AmenityOrder) => {
    setAmenityOrders(prev => [order, ...prev]);
  };

  // Concierge: Request Assistance
  const handleRequestAssistance = (issueTitle: string, description: string) => {
    const newWo: IncidentWorkOrder = {
      id: `wo-${Date.now()}`,
      siteNumber: selectedSite?.number || 'L-02',
      locationArea: `Site ${selectedSite?.number || 'L-02'}`,
      category: 'Guest Service Request',
      title: issueTitle,
      description,
      severity: 'medium',
      status: 'open',
      reportedAt: 'Just now',
      reportedBy: 'Camper Guest App',
      assignedCrew: 'Ranger Station On-Call'
    };
    setWorkOrders(prev => [newWo, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar with KPIs & Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        weather={weather}
        metrics={metrics}
        openWorkOrdersCount={workOrders.filter(w => w.status === 'open').length}
        onNewBookingClick={() => handleOpenBookingModal()}
      />

      {/* Park Announcement / Emergency Alert Banner */}
      {activeAlert && !bannerDismissed && (
        <div className={`px-4 py-2 text-xs flex items-center justify-between border-b shadow-md ${
          activeAlert.priority === 'emergency' 
            ? 'bg-rose-900/90 text-rose-100 border-rose-700' 
            : activeAlert.priority === 'warning'
            ? 'bg-orange-900/90 text-orange-100 border-orange-700'
            : 'bg-amber-950 text-amber-200 border-amber-800'
        }`}>
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <Radio className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />
            <div className="truncate">
              <strong className="font-bold uppercase tracking-wide mr-1.5">{activeAlert.title}:</strong>
              <span>{activeAlert.message}</span>
            </div>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="hover:opacity-75 p-1 text-slate-300"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Viewport Content Router */}
      <main className="flex-1 flex flex-col relative overflow-x-hidden">
        
        {/* VIEW 1: Interactive Park Map */}
        {currentView === 'map' && (
          <InteractiveParkMap
            sites={sites}
            selectedSite={selectedSite}
            onSelectSite={handleSelectSite}
          />
        )}

        {/* VIEW 2: Multi-Day Reservation Gantt Grid */}
        {currentView === 'reservation_gantt' && (
          <ReservationGanttGrid
            sites={sites}
            reservations={reservations}
            onSelectSite={handleSelectSite}
            onOpenNewBookingWithSlot={(siteId, date) => handleOpenBookingModal(siteId, date)}
          />
        )}

        {/* VIEW 3: Camper Digital Concierge & Pitch Delivery */}
        {currentView === 'concierge_portal' && (
          <GuestConciergePortal
            currentReservation={reservations[0]} // default primary stay (Marcus Sterling)
            amenityOrders={amenityOrders}
            onPlaceAmenityOrder={handlePlaceAmenityOrder}
            onRequestAssistance={handleRequestAssistance}
          />
        )}

        {/* VIEW 4: Maintenance Dispatch & AI Triage */}
        {currentView === 'maintenance_dispatch' && (
          <MaintenanceDispatch
            workOrders={workOrders}
            sites={sites}
            onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
            onCreateWorkOrder={handleCreateWorkOrder}
          />
        )}

        {/* VIEW 5: Executive Revenue Optimizer */}
        {currentView === 'revenue_optimizer' && (
          <RevenueOptimizer
            metrics={metrics}
            sites={sites}
            onApplyDynamicPricing={handleApplyDynamicPricing}
          />
        )}

        {/* VIEW 6: Park Broadcast & Emergency Center */}
        {currentView === 'broadcast_center' && (
          <BroadcastCenter
            broadcasts={broadcasts}
            weather={weather}
            onSendBroadcast={handleSendBroadcast}
          />
        )}

      </main>

      {/* Campsite Inspection & Quick Action Drawer */}
      <SiteDetailDrawer
        site={selectedSite}
        currentReservation={currentReservationForSelectedSite}
        onClose={handleCloseSiteDrawer}
        onCheckInGuest={handleCheckInGuest}
        onCheckOutGuest={handleCheckOutGuest}
        onNewBooking={(site) => handleOpenBookingModal(site.id)}
        onUpdateSiteStatus={handleUpdateSiteStatus}
        onOpenWorkOrderModal={(site) => {
          setCurrentView('maintenance_dispatch');
        }}
      />

      {/* Smart Reservation Creation Modal */}
      <NewReservationModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        sites={sites}
        preSelectedSiteId={bookingModalSiteId}
        preSelectedDate={bookingModalDate}
        onConfirmBooking={handleConfirmBooking}
      />

    </div>
  );
}
