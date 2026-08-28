import React, { useState } from 'react';
import { ParkBroadcast, ParkWeather } from '../types';
import { 
  Radio, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  Flame, 
  CloudRain, 
  Users, 
  Bot, 
  CheckCircle2, 
  MessageSquare,
  Volume2
} from 'lucide-react';

interface BroadcastCenterProps {
  broadcasts: ParkBroadcast[];
  weather: ParkWeather;
  onSendBroadcast: (broadcast: ParkBroadcast) => void;
}

export const BroadcastCenter: React.FC<BroadcastCenterProps> = ({
  broadcasts,
  weather,
  onSendBroadcast
}) => {
  const [topicType, setTopicType] = useState('Fire Danger Elevation');
  const [targetAudience, setTargetAudience] = useState<'all' | 'rv_loops' | 'tent_loops' | 'cabins'>('all');
  const [priority, setPriority] = useState<'info' | 'advisory' | 'warning' | 'emergency'>('advisory');
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sentToast, setSentToast] = useState(false);

  // Generate with Gemini AI
  const handleGenerateAiBroadcast = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gemini/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicType,
          priority,
          parkContext: {
            fireDangerLevel: weather.fireDangerLevel,
            temperature: weather.temperature,
            windSpeed: weather.windSpeed,
            weatherCondition: weather.condition,
            activeGuestCount: 58
          }
        })
      });

      const data = await response.json();
      setTitle(data.title || `${topicType} Notice`);
      setMessage(data.body || 'Please follow park ranger instructions.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const newBroadcast: ParkBroadcast = {
      id: `bc-${Date.now()}`,
      title,
      message,
      priority,
      targetAudience,
      sentAt: 'Just now',
      expiresAt: 'In 24 hours',
      active: true
    };

    onSendBroadcast(newBroadcast);
    setSentToast(true);
    setTitle('');
    setMessage('');
    setTimeout(() => setSentToast(false), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Park Broadcast & Emergency Alert Center</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Omnichannel SMS & In-App PUSH
            </span>
          </div>
          <p className="text-xs text-slate-400">Instantly notify all checked-in campers of weather changes, fire rules, or park events</p>
        </div>
      </div>

      {sentToast && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 flex items-center gap-3 shadow-2xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">Broadcast dispatched to 58 checked-in campers and digital park displays!</span>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Compose & AI Generation */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" /> Compose Park Announcement
            </h3>

            <button
              type="button"
              onClick={handleGenerateAiBroadcast}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/40 disabled:opacity-50 transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Drafting Alert...' : 'AI Compose Alert'}</span>
            </button>
          </div>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Preset Topic</label>
                <select
                  value={topicType}
                  onChange={e => setTopicType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="Fire Danger Elevation">Fire Danger Elevation</option>
                  <option value="Severe Weather Advisory">Severe Weather Advisory</option>
                  <option value="Campfire Stargazing Event">Campfire & Stargazing Event</option>
                  <option value="Water Line Maintenance">Water Line Maintenance</option>
                  <option value="Wildlife / Bear Advisory">Wildlife / Bear Advisory</option>
                  <option value="Quiet Hours Reminder">Quiet Hours Enforcement</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="advisory">Advisory (Amber)</option>
                  <option value="warning">Warning (Orange)</option>
                  <option value="emergency">Emergency (Red Flash)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="all">All Checked-In Campers (58)</option>
                  <option value="rv_loops">RV Loops Only</option>
                  <option value="tent_loops">Tent Campers Only</option>
                  <option value="cabins">Glamping & Cabin Guests</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Broadcast Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. Moderate Fire Danger: Campfires Restricted to Metal Rings"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Broadcast Message Body *</label>
              <textarea
                required
                rows={4}
                placeholder="Compose announcement details or click 'AI Compose Alert' above..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Will be delivered via SMS to registered phone numbers + live banner on guest portal.
              </span>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Instantly</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Active & Historic Broadcast Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> Recent Broadcasts
            </h3>
            <span className="text-xs text-slate-400 font-mono">{broadcasts.length} Sent</span>
          </div>

          <div className="space-y-3">
            {broadcasts.map(bc => (
              <div
                key={bc.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    bc.priority === 'emergency' ? 'bg-rose-600 text-white' :
                    bc.priority === 'warning' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                    bc.priority === 'advisory' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}>
                    {bc.priority.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500">{bc.sentAt}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-200">{bc.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{bc.message}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>Audience: {bc.targetAudience.replace('_', ' ').toUpperCase()}</span>
                  <span className="text-emerald-400 font-medium">Active on Portal</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
