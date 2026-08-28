export type SiteType = 
  | 'rv_full_hookup'
  | 'rv_electric_water'
  | 'glamping_safari'
  | 'glamping_dome'
  | 'waterfront_cabin'
  | 'eco_pod'
  | 'tent_powered'
  | 'tent_primitive';

export type SiteStatus = 
  | 'vacant'
  | 'occupied'
  | 'reserved'
  | 'cleaning_needed'
  | 'maintenance_blocked';

export type ParkLoop = 
  | 'Lakeside Ridge'
  | 'Pine Forest Haven'
  | 'Meadowbrook Loop'
  | 'Canyon Creek';

export interface SiteHookups {
  electricAmp: 0 | 20 | 30 | 50;
  water: boolean;
  sewer: boolean;
  firePit: boolean;
  picnicTable: boolean;
  shadeRating: 'Full Shade' | 'Partial Shade' | 'Open Sun';
  wifiStrength: 'Superfast 5G' | 'Strong' | 'Standard';
  drivewayType: 'Pull-Through' | 'Back-In' | 'Walk-In';
  padSurface: 'Concrete' | 'Gravel' | 'Grass / Natural' | 'Timber Deck';
}

export interface Campsite {
  id: string;
  number: string;
  name: string;
  type: SiteType;
  loop: ParkLoop;
  status: SiteStatus;
  maxRigLength: number | null; // in feet (e.g. 45 for large motorhome, null for tent)
  maxGuests: number;
  petFriendly: boolean;
  hookups: SiteHookups;
  baseRatePerNight: number;
  currentRatePerNight: number;
  description: string;
  imageUrl: string;
  mapCoordinates: {
    x: number;
    y: number;
  };
  currentReservationId?: string;
  currentBookingId?: string;
  nextCheckIn?: string;
}

export interface ReservationAddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: 'gear' | 'service' | 'comfort';
}

export interface Reservation {
  id: string;
  reservationCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  siteId: string;
  siteNumber: string;
  siteType: SiteType;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  numGuests: number;
  numPets: number;
  numVehicles: number;
  vehiclePlate: string;
  rigType?: 'Class A Motorhome' | 'Class C Motorhome' | 'Fifth Wheel' | 'Travel Trailer' | 'Campervan' | 'Roof Tent' | 'Ground Tent' | 'Cabin Stay';
  rigLength?: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'paid' | 'deposit_paid' | 'pending';
  addOns: ReservationAddOn[];
  specialRequests?: string;
  gateCode: string;
  checkInTime?: string;
  assignedStaffNotes?: string;
}

export interface IncidentWorkOrder {
  id: string;
  siteId?: string;
  siteNumber?: string;
  locationArea: string;
  category: 'Plumbing / Water' | 'Electrical Pedestal' | 'Tree / Grounds' | 'Quiet Hours / Noise' | 'Cabin Housekeeping' | 'Wildlife / Safety' | 'Gate & Access' | 'Guest Service Request';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  reportedAt: string;
  reportedBy: string;
  assignedCrew?: string;
  resolutionNotes?: string;
  aiTriageAnalysis?: {
    estimatedTime: string;
    immediateAction: string;
    partsRequired: string[];
    guestNoticeMessage: string;
  };
}

export interface ParkBroadcast {
  id: string;
  title: string;
  message: string;
  priority: 'info' | 'advisory' | 'warning' | 'emergency';
  targetAudience: 'all' | 'rv_loops' | 'tent_loops' | 'cabins';
  sentAt: string;
  expiresAt?: string;
  active: boolean;
}

export interface AmenityProduct {
  id: string;
  name: string;
  category: 'Watersports' | 'Recreation' | 'Camp Supplies' | 'Wellness';
  price: number;
  priceUnit: 'per hour' | 'per day' | 'per item' | 'per bundle';
  availableStock: number;
  totalStock: number;
  icon: string;
  description: string;
}

export interface AmenityOrder {
  id: string;
  orderCode: string;
  amenityId: string;
  amenityName: string;
  siteNumber: string;
  guestName: string;
  quantity: number;
  totalCost: number;
  status: 'placed' | 'delivering' | 'delivered' | 'completed';
  orderTime: string;
  estimatedDelivery?: string;
}

export interface ParkWeather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: string;
  fireDangerLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

export interface ParkMetrics {
  totalSites: number;
  occupiedSites: number;
  reservedToday: number;
  vacantSites: number;
  cleaningNeeded: number;
  maintenanceBlocked: number;
  occupancyRate: number; // percentage
  monthlyRevenue: number;
  averageDailyRate: number; // ADR
  revPAR: number; // Revenue Per Available Pitch
  totalActiveReservations: number;
  ancillarySpendPerStay: number;
}

export type AppViewMode = 
  | 'map'
  | 'reservation_gantt'
  | 'concierge_portal'
  | 'maintenance_dispatch'
  | 'revenue_optimizer'
  | 'broadcast_center';
