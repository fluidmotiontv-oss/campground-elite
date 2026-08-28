import React, { useState } from 'react';
import { Campsite, ParkMetrics } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  Percent, 
  BarChart3, 
  CheckCircle2, 
  Zap, 
  Bot, 
  Calendar, 
  ArrowUpRight, 
  Sliders, 
  Tag, 
  ShieldCheck,
  Check
} from 'lucide-react';

interface RevenueOptimizerProps {
  metrics: ParkMetrics;
  sites: Campsite[];
  onApplyDynamicPricing: (siteAdjustments: Array<{ siteId: string; newRate: number }>) => void;
}

export const RevenueOptimizer: React.FC<RevenueOptimizerProps> = ({
  metrics,
  sites,
  onApplyDynamicPricing
}) => {
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    yieldSummary?: string;
    rateRecommendations?: Array<{
      siteCategory: string;
      currentAvgRate: number;
      recommendedRate: number;
      demandSignal: string;
      reasoning: string;
    }>;
    projectedRevenueLiftMonthly?: number;
    upsellOpportunities?: string[];
  } | null>(null);

  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Call Executive Gemini AI endpoint
  const handleRunAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    setAppliedSuccess(false);

    try {
      const response = await fetch('/api/gemini/revenue-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          campsites: sites.map(s => ({
            id: s.id,
            number: s.number,
            type: s.type,
            rate: s.currentRatePerNight,
            status: s.status
          })),
          forecastContext: {
            upcomingHoliday: 'Labor Day Weekend (98% expected demand)',
            weatherSummary: 'Sunny 75°F-82°F all week',
            compSetOccupancy: '74%'
          }
        })
      });

      const data = await response.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleApplyRecommendations = () => {
    if (!aiAnalysisResult?.rateRecommendations) return;

    const adjustments: Array<{ siteId: string; newRate: number }> = [];

    // Map recommendations to sites
    for (const rec of aiAnalysisResult.rateRecommendations) {
      const matchingSites = sites.filter(s => {
        if (rec.siteCategory.toLowerCase().includes('rv') && s.type.startsWith('rv_')) return true;
        if (rec.siteCategory.toLowerCase().includes('cabin') && s.type === 'waterfront_cabin') return true;
        if (rec.siteCategory.toLowerCase().includes('glamping') && (s.type.startsWith('glamping_') || s.type === 'eco_pod')) return true;
        if (rec.siteCategory.toLowerCase().includes('tent') && s.type.startsWith('tent_')) return true;
        return false;
      });

      for (const site of matchingSites) {
        adjustments.push({
          siteId: site.id,
          newRate: rec.recommendedRate
        });
      }
    }

    if (adjustments.length > 0) {
      onApplyDynamicPricing(adjustments);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Executive Revenue Optimizer & Yield Engine</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              AI Dynamic Pricing
            </span>
          </div>
          <p className="text-xs text-slate-400">Algorithmic pitch surge pricing, RevPAR optimization & high-margin amenity bundling</p>
        </div>

        <button
          onClick={handleRunAiAnalysis}
          disabled={isAiAnalyzing}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAiAnalyzing ? 'Synthesizing Yield Algorithm...' : 'Run Executive AI Yield Analysis'}</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Monthly Revenue */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 shadow-md">
          <span className="text-[11px] text-slate-400 font-medium block">Monthly Revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-400 font-mono">
              ${metrics.monthlyRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center font-bold">
              <ArrowUpRight className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Projected: $54,800</span>
        </div>

        {/* Occupancy Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 shadow-md">
          <span className="text-[11px] text-slate-400 font-medium block">Park Occupancy</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white font-mono">
              {metrics.occupancyRate}%
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">+6.2% vs comp</span>
          </div>
          <span className="text-[10px] text-slate-500">22 of 28 Pitches filled</span>
        </div>

        {/* RevPAR */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 shadow-md">
          <span className="text-[11px] text-slate-400 font-medium block">RevPAR (Per Pitch)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white font-mono">
              ${metrics.revPAR}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">+12%</span>
          </div>
          <span className="text-[10px] text-slate-500">Industry avg: $52.00</span>
        </div>

        {/* ADR */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 shadow-md">
          <span className="text-[11px] text-slate-400 font-medium block">Average Daily Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white font-mono">
              ${metrics.averageDailyRate}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">/ night</span>
          </div>
          <span className="text-[10px] text-slate-500">High: $220 • Low: $38</span>
        </div>

        {/* Ancillary Spend */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 shadow-md col-span-2 lg:col-span-1">
          <span className="text-[11px] text-slate-400 font-medium block">Ancillary Spend / Stay</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-400 font-mono">
              ${metrics.ancillarySpendPerStay}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">Firewood, Kayaks</span>
          </div>
          <span className="text-[10px] text-slate-500">+34% vs baseline</span>
        </div>

      </div>

      {/* AI Yield Recommendations Panel */}
      {aiAnalysisResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/40 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Gemini Yield Intelligence Plan
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                  {aiAnalysisResult.yieldSummary || 'Strategic dynamic surge pricing recommendation generated based on real-time park capacity and holiday demand forecast.'}
                </p>
              </div>
            </div>

            <div className="text-right bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Projected Monthly Lift
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                +${aiAnalysisResult.projectedRevenueLiftMonthly?.toLocaleString() || '4,280'}
              </span>
            </div>
          </div>

          {/* Rate Adjustments Table */}
          {aiAnalysisResult.rateRecommendations && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Category Rate Adjustments
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiAnalysisResult.rateRecommendations.map((rec, idx) => {
                  const delta = rec.recommendedRate - rec.currentAvgRate;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{rec.siteCategory}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-800 text-slate-300">
                            {rec.demandSignal}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{rec.reasoning}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-xs text-slate-500 line-through font-mono">${rec.currentAvgRate}</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">${rec.recommendedRate}</span>
                        </div>
                        <span className={`text-[10px] font-bold block ${delta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {delta >= 0 ? `+$${delta}/nt` : `-$${Math.abs(delta)}/nt`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upsell Opportunities */}
          {aiAnalysisResult.upsellOpportunities && (
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                High-Margin Package Opportunities
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {aiAnalysisResult.upsellOpportunities.map((op, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-200">
                    💡 {op}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Applying will instantly update all 28 pitch rates across the booking grid.
            </span>

            <div className="flex items-center gap-3">
              {appliedSuccess ? (
                <span className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Rates Synchronized!
                </span>
              ) : (
                <button
                  onClick={handleApplyRecommendations}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deploy AI Rates to Park Pitch Grid</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Rate Matrix by Loop / Campsite */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" /> Current Campsite Pitch Rate Card (28 Units)
          </h3>
          <span className="text-xs text-slate-400">Base Rates & Live Status</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sites.map(site => (
            <div
              key={site.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-emerald-400">#{site.number}</span>
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">{site.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 block">{site.loop} • {site.hookups.drivewayType}</span>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-white font-mono">${site.currentRatePerNight}</span>
                <span className="text-[9px] text-slate-500 block">/ night</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
