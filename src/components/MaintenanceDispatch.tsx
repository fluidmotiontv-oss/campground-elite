import React, { useState } from 'react';
import { IncidentWorkOrder, Campsite } from '../types';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus, 
  Bot, 
  Filter, 
  UserCheck, 
  CheckCircle,
  FileText,
  ShieldAlert
} from 'lucide-react';

interface MaintenanceDispatchProps {
  workOrders: IncidentWorkOrder[];
  sites: Campsite[];
  onUpdateWorkOrderStatus: (id: string, newStatus: 'open' | 'in_progress' | 'resolved', notes?: string) => void;
  onCreateWorkOrder: (order: IncidentWorkOrder) => void;
}

export const MaintenanceDispatch: React.FC<MaintenanceDispatchProps> = ({
  workOrders,
  sites,
  onUpdateWorkOrderStatus,
  onCreateWorkOrder
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTriageOrder, setActiveTriageOrder] = useState<IncidentWorkOrder | null>(null);
  const [isTriageLoading, setIsTriageLoading] = useState(false);

  // New Work Order Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<any>('Electrical Pedestal');
  const [newSeverity, setNewSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [newSiteNumber, setNewSiteNumber] = useState('L-02');
  const [newDescription, setNewDescription] = useState('');
  const [assignedCrew, setAssignedCrew] = useState('Electrical Tech John');

  const filteredOrders = workOrders.filter(wo => {
    if (selectedCategory !== 'ALL' && wo.category !== selectedCategory) return false;
    return true;
  });

  const openOrders = filteredOrders.filter(w => w.status === 'open');
  const inProgressOrders = filteredOrders.filter(w => w.status === 'in_progress');
  const resolvedOrders = filteredOrders.filter(w => w.status === 'resolved');

  // Trigger AI Triage Analysis via `/api/gemini/dispatch`
  const handleRunAiTriage = async (order: IncidentWorkOrder) => {
    setIsTriageLoading(true);
    setActiveTriageOrder(order);

    try {
      const response = await fetch('/api/gemini/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentTitle: order.title,
          description: order.description,
          category: order.category,
          siteNumber: order.siteNumber
        })
      });

      const data = await response.json();
      setActiveTriageOrder({
        ...order,
        aiTriageAnalysis: {
          estimatedTime: data.estimatedResolutionTime || '25 mins',
          immediateAction: data.safetyImmediateAction || 'Isolate master subpanel circuit breaker.',
          partsRequired: data.partsAndToolsRequired || ['Standard toolkit', 'Multimeter'],
          guestNoticeMessage: data.guestCommunicationMessage || 'Ranger dispatched to site.'
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriageLoading(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    const newOrder: IncidentWorkOrder = {
      id: `wo-${Date.now()}`,
      siteNumber: newSiteNumber,
      locationArea: `Site ${newSiteNumber}`,
      category: newCategory,
      title: newTitle,
      description: newDescription,
      severity: newSeverity,
      status: 'open',
      reportedAt: 'Just now',
      reportedBy: 'Front Desk Dispatch',
      assignedCrew
    };

    onCreateWorkOrder(newOrder);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white animate-pulse">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">LOW</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Park Operations & Maintenance Dispatch</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {openOrders.length} Open Work Orders
            </span>
          </div>
          <p className="text-xs text-slate-400">Incident ticketing, automated AI crew triage & site turnover tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Categories ({workOrders.length})</option>
            <option value="Electrical Pedestal">Electrical Pedestal</option>
            <option value="Plumbing / Water">Plumbing & Water</option>
            <option value="Cabin Housekeeping">Cabin Housekeeping</option>
            <option value="Tree / Grounds">Tree & Grounds</option>
            <option value="Quiet Hours / Noise">Quiet Hours & Noise</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Column 1: Open / Unassigned */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Open Tickets ({openOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {openOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg space-y-3 transition-all group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {order.locationArea}
                  </span>
                  {getSeverityBadge(order.severity)}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {order.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{order.description}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>Reported {order.reportedAt}</span>
                  <span className="text-slate-400">{order.category}</span>
                </div>

                {/* AI Triage Trigger & Quick Status Actions */}
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => handleRunAiTriage(order)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>AI Triage</span>
                  </button>

                  <button
                    onClick={() => onUpdateWorkOrderStatus(order.id, 'in_progress')}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Dispatch Crew</span>
                  </button>
                </div>
              </div>
            ))}

            {openOrders.length === 0 && (
              <div className="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No open maintenance tickets. All systems green.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              In Progress ({inProgressOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {inProgressOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-lg space-y-3 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {order.locationArea}
                  </span>
                  {getSeverityBadge(order.severity)}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{order.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{order.description}</p>
                </div>

                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  <span className="text-slate-500 text-[10px] block">Assigned Crew</span>
                  <span className="font-semibold text-emerald-400">{order.assignedCrew || 'Ranger On-Duty'}</span>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => handleRunAiTriage(order)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>View AI Plan</span>
                  </button>

                  <button
                    onClick={() => onUpdateWorkOrderStatus(order.id, 'resolved', 'Repaired and verified on-site.')}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>
            ))}

            {inProgressOrders.length === 0 && (
              <div className="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No active work orders currently in field progress.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Resolved */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Recently Resolved ({resolvedOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {resolvedOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 opacity-80 hover:opacity-100 shadow-md space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {order.locationArea}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    RESOLVED
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-200 line-through decoration-slate-500">
                  {order.title}
                </h4>

                <p className="text-[10px] text-slate-400 italic">
                  {order.resolutionNotes || 'Completed and cleared by maintenance team.'}
                </p>
              </div>
            ))}

            {resolvedOrders.length === 0 && (
              <div className="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                Completed work tickets will archive here.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* AI Triage Modal / Drawer */}
      {activeTriageOrder && activeTriageOrder.aiTriageAnalysis && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">AI Maintenance Triage Guidance</h3>
                  <p className="text-xs text-slate-400">{activeTriageOrder.title} ({activeTriageOrder.locationArea})</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTriageOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                  ⚡ Immediate Safety Protocol
                </span>
                <p className="font-semibold text-amber-300">
                  {activeTriageOrder.aiTriageAnalysis.immediateAction}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                    Estimated Time
                  </span>
                  <p className="font-bold text-emerald-400 text-sm mt-0.5">
                    {activeTriageOrder.aiTriageAnalysis.estimatedTime}
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                    Parts & Tools
                  </span>
                  <ul className="text-slate-300 text-[11px] list-disc list-inside mt-0.5">
                    {activeTriageOrder.aiTriageAnalysis.partsRequired.map((part, idx) => (
                      <li key={idx}>{part}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                  💬 Auto-Composed Guest Update SMS
                </span>
                <p className="text-slate-300 italic text-[11px]">
                  "{activeTriageOrder.aiTriageAnalysis.guestNoticeMessage}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveTriageOrder(null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Acknowledge Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Work Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" /> Log Maintenance Work Order
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water leak at Site 24 Spigot"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Campsite / Area</label>
                  <select
                    value={newSiteNumber}
                    onChange={e => setNewSiteNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.number}>
                        Site {s.number} ({s.loop})
                      </option>
                    ))}
                    <option value="Bathhouse A">Bathhouse A</option>
                    <option value="Boat Launch">Boat Launch</option>
                    <option value="Welcome Center">Welcome Center</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="Electrical Pedestal">Electrical Pedestal</option>
                    <option value="Plumbing / Water">Plumbing / Water</option>
                    <option value="Cabin Housekeeping">Cabin Housekeeping</option>
                    <option value="Tree / Grounds">Tree / Grounds</option>
                    <option value="Quiet Hours / Noise">Quiet Hours</option>
                    <option value="Gate & Access">Gate & Access</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="low">Low (Routine)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={assignedCrew}
                    onChange={e => setAssignedCrew(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe location, symptoms, and urgency..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40"
                >
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
