
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { TimelogData, TimelogTag, TagConfig } from '../types';
import { ICONS } from '../constants';
import { Select } from './ui/Select';
import { 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useSound } from '../contexts/SoundContext';

interface TimelogPageProps {
  onBack: () => void;
}

type TimeScale = 'day' | 'week' | 'month' | 'year';
type PlotType = 'density' | 'distribution';
type ViewMode = 'calendar' | 'flow';

const PRESET_COLORS = [
  '#06b6d4', '#10b981', '#8b5cf6', '#f43f5e', 
  '#f59e0b', '#3b82f6', '#ec4899', '#ffffff', 
  '#94a3b8', '#fb7185', '#2dd4bf', '#a78bfa'
];

const getHourLabel = (h: number) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}${period}`;
};

const TimelogPage: React.FC<TimelogPageProps> = React.memo(({ onBack }) => {
  const { 
    timelog, 
    setTimelog, 
    tagConfigs, 
    setTagConfigs, 
    uiState, 
    setTimelogViewMode 
  } = usePlayerStore(useShallow(state => ({
    timelog: state.timelog,
    setTimelog: state.setTimelog,
    tagConfigs: state.tagConfigs,
    setTagConfigs: state.setTagConfigs,
    uiState: state.uiState,
    setTimelogViewMode: state.setTimelogViewMode
  })));

  const { playSuccess } = useSound();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDaySelected, setIsDaySelected] = useState(true);
  const [selectedTagId, setSelectedTagId] = useState<string>(tagConfigs[0]?.id || '');
  const [timeScale, setTimeScale] = useState<TimeScale>('month');
  const [pulseScale, setPulseScale] = useState<TimeScale>('month');
  const [plotType, setPlotType] = useState<PlotType>('density');
  const viewMode = uiState.timelogViewMode;
  const setViewMode = setTimelogViewMode;
  const [trendScale, setTrendScale] = useState<TimeScale>('month');
  const [trendType, setTrendType] = useState<'area' | 'bar'>('area');
  
  // Day Window Settings
  const [dayStart, setDayStart] = useState(() => Number(localStorage.getItem('sys_day_start') || 7));
  const [dayEnd, setDayEnd] = useState(() => Number(localStorage.getItem('sys_day_end') || 22));

  // Modals
  const [confirmClear, setConfirmClear] = useState<{ type: 'day' | 'month', key?: string } | null>(null);
  const [editingTag, setEditingTag] = useState<TagConfig | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);

  useEffect(() => {
    localStorage.setItem('sys_day_start', dayStart.toString());
    localStorage.setItem('sys_day_end', dayEnd.toString());
  }, [dayStart, dayEnd]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const changeMonth = useCallback((delta: number) => {
    const today = new Date();
    const targetDate = new Date(year, month + delta, 1);
    
    // If navigating to the current month, default to today
    if (targetDate.getMonth() === today.getMonth() && targetDate.getFullYear() === today.getFullYear()) {
      setCurrentDate(today);
    } else {
      // Otherwise preserve the day if possible
      const lastDayOfTarget = new Date(year, month + delta + 1, 0).getDate();
      const nextDay = Math.min(currentDate.getDate(), lastDayOfTarget);
      setCurrentDate(new Date(year, month + delta, nextDay));
    }
  }, [year, month, currentDate]);

  const toggleBlock = useCallback((day: number, hour: number, targetYear?: number, targetMonth?: number) => {
    const y = targetYear ?? year;
    const m = targetMonth ?? month;
    const dateKey = `${y}-${m}-${day}`;
    setTimelog(prev => {
      const dayData = prev[dateKey] || {};
      const currentTagId = dayData[hour] || '';
      const nextTagId = currentTagId === selectedTagId ? '' : selectedTagId;
      
      return {
        ...prev,
        [dateKey]: {
          ...dayData,
          [hour]: nextTagId
        }
      };
    });
  }, [year, month, selectedTagId, setTimelog]);

  const isToday = useCallback((day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  }, [month, year]);

  const handleSaveTag = useCallback((tag: TagConfig) => {
    if (isAddingTag) {
      setTagConfigs(prev => [...prev, tag]);
      playSuccess();
    } else {
      setTagConfigs(prev => prev.map(t => t.id === tag.id ? tag : t));
    }
    setEditingTag(null);
    setIsAddingTag(false);
  }, [isAddingTag, setTagConfigs]);

  const handleDeleteTag = useCallback((id: string) => {
    setTagConfigs(prev => prev.filter(t => t.id !== id));
    setEditingTag(null);
  }, [setTagConfigs]);

  const handleClearDay = useCallback((key: string) => {
    setTimelog(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setConfirmClear(null);
  }, [setTimelog]);

  const handleClearMonth = useCallback(() => {
    setTimelog(prev => {
      const next = { ...prev };
      const prefix = `${year}-${month}-`;
      Object.keys(next).forEach(key => {
        if (key.startsWith(prefix)) {
          delete next[key];
        }
      });
      return next;
    });
    setConfirmClear(null);
  }, [year, month, setTimelog]);

  // --- ANALYTICS CALCULATIONS ---

  const heatmapData = useMemo(() => {
    const results = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      tags: {} as Record<string, number>,
      total: 0
    }));

    const processDate = (d: Date) => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const dayData = timelog[key];
      if (dayData) {
        Object.entries(dayData).forEach(([hour, tagId]) => {
          const h = Number(hour);
          if (tagId && results[h]) {
            const tid = tagId as string;
            results[h].tags[tid] = (results[h].tags[tid] || 0) + 1;
            results[h].total++;
          }
        });
      }
    };

    if (timeScale === 'day') {
      if (isDaySelected) processDate(currentDate);
    } else if (timeScale === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1));
      for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(d.getDate() + i);
        processDate(d);
      }
    } else if (timeScale === 'month') {
      const days = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= days; i++) processDate(new Date(year, month, i));
    } else if (timeScale === 'year') {
      for (let m = 0; m < 12; m++) {
        const days = new Date(year, m + 1, 0).getDate();
        for (let i = 1; i <= days; i++) processDate(new Date(year, m, i));
      }
    }

    return results;
  }, [timelog, currentDate, isDaySelected, timeScale, year, month]);

  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    let grandTotal = 0;
    heatmapData.forEach(h => {
      Object.entries(h.tags).forEach(([tagId, count]) => {
        const c = count as number;
        counts[tagId] = (counts[tagId] || 0) + c;
        grandTotal += c;
      });
    });
    return { counts, total: grandTotal };
  }, [heatmapData]);

  const systemicAutopsy = useMemo(() => {
    if (distributionData.total === 0) {
      return timeScale === 'day' && !isDaySelected 
        ? "Select a day to perform systemic autopsy." 
        : "Insufficient log data to perform systemic autopsy.";
    }

    // Find peak hour
    const peakHourData = [...heatmapData].sort((a, b) => b.total - a.total)[0];
    const peakTimeLabel = getHourLabel(peakHourData.hour);

    // Find dominant tag overall for this timescale
    const dominantTagId = Object.entries(distributionData.counts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];
    
    const config = tagConfigs.find(t => t.id === dominantTagId);
    const tagLabel = config ? config.label.toLowerCase() : "unidentified";
    
    const scaleLabel = timeScale === 'day' ? 'today' : timeScale === 'week' ? 'this week' : timeScale === 'month' ? 'this month' : 'this year';

    return `Most progress occurred around the ${peakTimeLabel} window, primarily driven by ${tagLabel} work ${scaleLabel}.`;
  }, [heatmapData, distributionData, tagConfigs, timeScale]);

  const productivityPulseData = useMemo(() => {
    const data: { label: string, hours: number }[] = [];
    
    const getProductiveHours = (d: Date) => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const dayData = timelog[key] || {};
      return Object.values(dayData).filter(tagId => tagId !== '').length;
    };

    if (pulseScale === 'day') {
      // For day view, show hours of the day
      for (let h = 0; h < 24; h++) {
        const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        const dayData = timelog[key] || {};
        data.push({ label: getHourLabel(h), hours: (isDaySelected && dayData[h]) ? 1 : 0 });
      }
    } else if (pulseScale === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1));
      for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(d.getDate() + i);
        data.push({ label: d.toLocaleDateString([], { weekday: 'short' }), hours: getProductiveHours(d) });
      }
    } else if (pulseScale === 'month') {
      const days = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= days; i++) {
        const d = new Date(year, month, i);
        data.push({ label: i.toString(), hours: getProductiveHours(d) });
      }
    } else if (pulseScale === 'year') {
      for (let m = 0; m < 12; m++) {
        let monthHours = 0;
        const days = new Date(year, m + 1, 0).getDate();
        for (let i = 1; i <= days; i++) {
          monthHours += getProductiveHours(new Date(year, m, i));
        }
        data.push({ label: new Date(year, m, 1).toLocaleDateString([], { month: 'short' }), hours: monthHours });
      }
    }

    return data;
  }, [timelog, currentDate, isDaySelected, pulseScale, year, month]);

  const trendData = useMemo(() => {
    const data: { label: string, hours: number }[] = [];
    
    const getProductiveHours = (d: Date) => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const dayData = timelog[key] || {};
      return Object.values(dayData).filter(tagId => tagId !== '').length;
    };

    if (trendScale === 'day') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        data.push({ 
          label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), 
          hours: getProductiveHours(d) 
        });
      }
    } else if (trendScale === 'week') {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - (i * 7));
        // Find start of that week (Monday)
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        
        let weekTotal = 0;
        for (let j = 0; j < 7; j++) {
          const dayInWeek = new Date(monday);
          dayInWeek.setDate(dayInWeek.getDate() + j);
          weekTotal += getProductiveHours(dayInWeek);
        }
        data.push({ 
          label: `W${i === 0 ? ' (Now)' : -i}`, 
          hours: weekTotal 
        });
      }
    } else if (trendScale === 'month') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        
        let monthTotal = 0;
        const daysInM = new Date(y, m + 1, 0).getDate();
        for (let j = 1; j <= daysInM; j++) {
          monthTotal += getProductiveHours(new Date(y, m, j));
        }
        data.push({ 
          label: d.toLocaleDateString([], { month: 'short' }), 
          hours: monthTotal 
        });
      }
    } else if (trendScale === 'year') {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const y = new Date().getFullYear() - i;
        let yearTotal = 0;
        for (let m = 0; m < 12; m++) {
          const daysInM = new Date(y, m + 1, 0).getDate();
          for (let j = 1; j <= daysInM; j++) {
            yearTotal += getProductiveHours(new Date(y, m, j));
          }
        }
        data.push({ label: y.toString(), hours: yearTotal });
      }
    }

    return data;
  }, [timelog, trendScale]);

  const visibleHours = useMemo(() => {
    const hours = [];
    let curr = dayStart;
    while (curr !== dayEnd) {
      hours.push(curr);
      curr = (curr + 1) % 24;
    }
    hours.push(dayEnd);
    return hours;
  }, [dayStart, dayEnd]);

  const analytics = useMemo(() => {
    const total = distributionData.total || 1;
    return tagConfigs.map(tag => {
      const hours = distributionData.counts[tag.id] || 0;
      return {
        name: tag.label,
        hours,
        percentage: Math.round((hours / total) * 100),
        color: tag.color
      };
    }).sort((a, b) => b.hours - a.hours);
  }, [distributionData, tagConfigs]);

  const getDaysInMonthGrid = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startPadding = (firstDay.getDay() + 6) % 7; // Monday = 0
    
    for (let i = 0; i < startPadding; i++) {
      const prevDate = new Date(year, month, -startPadding + i + 1);
      days.push({ date: prevDate, currentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    
    while (days.length < 42) {
      const nextDate = new Date(year, month + 1, days.length - (startPadding + lastDay.getDate()) + 1);
      days.push({ date: nextDate, currentMonth: false });
    }
    
    return days;
  };

  const monthGrid = getDaysInMonthGrid();

  const handleDayClick = useCallback((day: number) => {
    const isSameDay = currentDate.getDate() === day && 
                     currentDate.getMonth() === month && 
                     currentDate.getFullYear() === year;
    
    if (isSameDay && isDaySelected) {
      setIsDaySelected(false);
    } else {
      setCurrentDate(new Date(year, month, day));
      setIsDaySelected(true);
    }
  }, [currentDate, month, year, isDaySelected]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; 
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="w-full space-y-6 sm:space-y-10 animate-in slide-in-from-bottom-4 duration-700 pb-20 px-4 sm:px-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
          <button onClick={onBack} className="p-2.5 sm:p-3 rounded-2xl bg-system-bg-panel-solid/95 border border-system-accent/20 hover:bg-system-accent/10 transition-all hover:border-system-accent/40 backdrop-blur-md group shrink-0">
            <ICONS.ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-system-text-muted group-hover:text-system-accent transition-colors" />
          </button>
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <h1 className="text-xl sm:text-4xl font-orbitron system-glow text-system-accent uppercase tracking-tighter truncate">Chronicle</h1>
            <p className="text-[7px] sm:text-[10px] font-orbitron text-system-text-muted uppercase tracking-[0.1em] sm:tracking-[0.3em] opacity-60 leading-tight break-words">
              Temporal Log & Neural Activity Tracking
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-6">
          <div id="timelog-view-toggle" className="flex bg-black/40 p-1 rounded-xl border border-system-accent/20 backdrop-blur-md shrink-0">
            <button 
              id="timelog-calendar-btn"
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-[8px] sm:text-[10px] font-orbitron uppercase transition-all ${viewMode === 'calendar' ? 'bg-system-accent text-system-bg-base' : 'text-system-text-muted hover:text-system-accent'}`}
            >
              Calendar
            </button>
            <button 
              id="timelog-flow-btn"
              onClick={() => setViewMode('flow')}
              className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-[8px] sm:text-[10px] font-orbitron uppercase transition-all ${viewMode === 'flow' ? 'bg-system-accent text-system-bg-base' : 'text-system-text-muted hover:text-system-accent'}`}
            >
              Flow
            </button>
          </div>
          <button 
            id="timelog-purge-btn"
            onClick={() => setConfirmClear({ type: 'month' })}
            className="text-[8px] sm:text-[10px] font-orbitron text-system-text-muted hover:text-red-400 uppercase tracking-[0.15em] border border-system-accent/10 px-3 sm:px-4 py-2 rounded-xl transition-all hover:bg-red-500/5 hover:border-red-500/30 shrink-0"
          >
            Purge
          </button>
          <div className="flex items-center bg-black/40 p-1 rounded-xl sm:rounded-2xl border border-system-accent/10 backdrop-blur-md">
            <div className="hidden md:block px-3 py-1 text-[9px] font-orbitron text-system-text-muted uppercase tracking-widest opacity-60">Window:</div>
            <div className="w-16 sm:w-28">
              <Select 
                value={dayStart} 
                onChange={(e) => setDayStart(Number(e.target.value))}
                options={Array.from({length: 24}).map((_, i) => ({ label: getHourLabel(i), value: i }))}
                className="text-[8px] sm:text-[10px] font-orbitron border-none bg-transparent h-7 sm:h-8 focus:ring-0"
              />
            </div>
            <span className="text-system-accent/40 mx-0.5 sm:mx-1">→</span>
            <div className="w-16 sm:w-28">
              <Select 
                value={dayEnd} 
                onChange={(e) => setDayEnd(Number(e.target.value))}
                options={Array.from({length: 24}).map((_, i) => ({ label: getHourLabel(i), value: i }))}
                className="text-[8px] sm:text-[10px] font-orbitron border-none bg-transparent h-7 sm:h-8 focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {viewMode === 'calendar' ? (
          <>
            {/* LARGE CALENDAR GRID */}
            <div id="timelog-calendar" className="lg:col-span-9 space-y-6">
              <div className="bg-system-bg-panel-solid/95 border border-system-accent/10 rounded-[2.5rem] p-6 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
                {/* System Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-system-accent/20 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-system-accent/20 rounded-br-3xl" />
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-system-accent/10 text-system-text-muted hover:text-system-accent transition-all">
                      <ICONS.ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <h2 className="text-base sm:text-xl font-orbitron text-system-accent tracking-[0.2em] sm:tracking-[0.3em] uppercase text-center">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-system-accent/10 text-system-text-muted hover:text-system-accent transition-all">
                      <ICONS.ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-system-accent/10 border border-system-accent/20 rounded-lg text-[9px] sm:text-[10px] font-orbitron text-system-accent uppercase tracking-widest">
                      {timeScale} View
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-system-accent/5 border border-system-accent/10 rounded-2xl overflow-hidden shadow-2xl">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="bg-system-bg-base/80 py-4 text-center text-[10px] font-orbitron text-system-text-muted uppercase tracking-widest border-b border-system-accent/10">
                      {day}
                    </div>
                  ))}
                  {monthGrid.map(({ date, currentMonth }, idx) => {
                    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                    const isTodayVal = isToday(date.getDate()) && date.getMonth() === month && date.getFullYear() === year;
                    const isSelected = currentDate.getDate() === date.getDate() && currentDate.getMonth() === date.getMonth() && currentDate.getFullYear() === date.getFullYear();
                    const dayLogs = timelog[dateKey] || {};
                    
                    return (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setCurrentDate(date);
                          setIsDaySelected(true);
                        }}
                        className={`min-h-[140px] bg-system-bg-base/40 p-2 border-r border-b border-system-accent/5 transition-all cursor-pointer group hover:bg-system-accent/5 ${!currentMonth ? 'opacity-20' : ''} ${isSelected ? 'ring-1 ring-inset ring-system-accent/40 bg-system-accent/5' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[11px] font-orbitron ${isTodayVal ? 'text-system-accent font-bold' : 'text-system-text-muted'}`}>
                            {date.getDate()}
                          </span>
                        </div>
                        
                        {/* 4x4 Hour Grid */}
                        <div className="grid grid-cols-4 gap-1">
                          {visibleHours.map(hour => {
                            const tagId = dayLogs[hour];
                            const tag = tagId ? tagConfigs.find(t => t.id === tagId) : null;
                            
                            return (
                              <div 
                                key={hour}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBlock(date.getDate(), hour, date.getFullYear(), date.getMonth());
                                  setCurrentDate(date);
                                  setIsDaySelected(true);
                                }}
                                className={`aspect-square rounded-[2px] border border-white/5 transition-all cursor-pointer hover:scale-110 hover:z-10 ${tag ? 'shadow-[0_0_5px_rgba(255,255,255,0.1)]' : 'hover:bg-white/10'}`}
                                style={{ 
                                  backgroundColor: tag ? `${tag.color}CC` : 'rgba(255,255,255,0.02)',
                                  borderColor: tag ? tag.color : 'transparent'
                                }}
                                title={`${getHourLabel(hour)} - ${tag?.label || 'Empty'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-system-bg-panel-solid/95 border border-system-accent/10 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-xl">
                  <h3 className="text-[11px] font-orbitron text-system-accent uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <ICONS.Activity className="w-4 h-4" />
                    Efficiency Metrics
                  </h3>
                  <div className="space-y-4">
                    {analytics.slice(0, 5).map((stat, idx) => (
                      <div key={idx} className="space-y-2 group">
                        <div className="flex justify-between text-[10px] font-orbitron uppercase tracking-widest">
                          <span className="text-system-text-muted group-hover:text-white transition-colors">{stat.name}</span>
                          <span className="text-system-accent">{stat.hours}h ({stat.percentage}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-1000"
                            style={{ backgroundColor: stat.color, width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-system-bg-panel-solid/95 border border-system-accent/10 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-xl">
                  <h3 className="text-[11px] font-orbitron text-system-accent uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <ICONS.Info className="w-4 h-4" />
                    Systemic Autopsy
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-system-text-muted font-light italic leading-relaxed opacity-90">
                      "{systemicAutopsy}"
                    </p>
                    <div className="pt-4 border-t border-system-accent/10">
                      <div className="flex items-center justify-between text-[10px] font-orbitron text-system-text-muted uppercase tracking-widest">
                        <span>Peak Performance</span>
                        <span className="text-system-accent">
                          {Math.max(...productivityPulseData.map(d => d.hours))}H
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="lg:col-span-3 space-y-8">
              {/* MATRIX CONTEXTS */}
              <section id="timelog-contexts" className="bg-system-bg-panel-solid/95 p-8 rounded-[2.5rem] border border-system-accent/10 backdrop-blur-2xl relative shadow-xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[11px] font-orbitron text-system-text-muted uppercase tracking-[0.3em] flex items-center gap-2 opacity-60">
                    <ICONS.Sword className="w-3.5 h-3.5" /> Contexts
                  </h3>
                  <button 
                    onClick={() => { setIsAddingTag(true); setEditingTag({ id: Date.now().toString(), label: '', color: '#06b6d4', description: '' }); }}
                    className="text-system-accent hover:scale-110 transition-all"
                  >
                    <ICONS.Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {tagConfigs.map((data) => (
                    <button
                      key={data.id}
                      onClick={() => setSelectedTagId(data.id)}
                      className={`
                        w-full flex items-center gap-4 p-3 rounded-2xl border transition-all text-left relative overflow-hidden
                        ${selectedTagId === data.id ? 'bg-system-accent/15 border-system-accent/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' : 'bg-black/20 border-system-accent/5 opacity-60 hover:opacity-100 hover:bg-black/30'}
                      `}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: data.color, color: data.color }} />
                      <div className="flex flex-col min-w-0">
                        <div className={`text-[11px] font-orbitron uppercase truncate tracking-widest ${selectedTagId === data.id ? 'text-system-accent' : 'text-system-text'}`}>{data.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* HOURLY DETAIL */}
              <div className="bg-system-bg-panel-solid/95 border border-system-accent/10 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-xl">
                <h3 className="text-[11px] font-orbitron text-system-accent uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <ICONS.Clock className="w-4 h-4" />
                  {currentDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} Detail
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {visibleHours.map(hour => {
                    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
                    const tagId = timelog[dateKey]?.[hour];
                    const tag = tagId ? tagConfigs.find(t => t.id === tagId) : null;
                    
                    return (
                      <div 
                        key={hour}
                        onClick={() => toggleBlock(currentDate.getDate(), hour)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${tag ? 'bg-system-accent/5 border-system-accent/20' : 'bg-black/20 border-system-accent/5 hover:border-system-accent/20'}`}
                      >
                        <span className="text-[10px] font-orbitron text-system-text-muted uppercase">
                          {getHourLabel(hour)}
                        </span>
                        {tag ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                            <span className="text-[10px] font-orbitron text-system-accent uppercase">
                              {tag.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-orbitron text-white/10 uppercase group-hover:text-system-accent/40">
                            Vacant
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Left Column: Navigation & Contexts (Flow View) */}
            <div className="lg:col-span-4 space-y-8">
          <div id="timelog-calendar" className="bg-system-bg-panel-solid/95 p-8 rounded-[2.5rem] border border-system-accent/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            {/* System Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-system-accent/20 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-system-accent/20 rounded-br-3xl" />
            
            <div className="flex items-center justify-between mb-8 gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-system-accent/10 text-system-text-muted hover:text-system-accent transition-all shrink-0">
                <ICONS.ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h2 className="text-sm sm:text-base font-orbitron text-system-text tracking-[0.2em] sm:tracking-[0.3em] uppercase truncate text-center">
                {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
              </h2>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-system-accent/10 text-system-text-muted hover:text-system-accent transition-all shrink-0">
                <ICONS.ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, i) => (
                <div key={i} className="text-[9px] text-center font-orbitron text-system-text-muted uppercase pb-2 opacity-40 tracking-widest">{dayName}</div>
              ))}
              
              {blanks.map(i => <div key={`blank-${i}`} className="aspect-square opacity-5" />)}
              
              {days.map(day => {
                const dateKey = `${year}-${month}-${day}`;
                const blocks = timelog[dateKey] || {};
                const filledCount = Object.keys(blocks).length;
                const currentDay = isToday(day);
                const isSelected = isDaySelected && currentDate.getDate() === day && currentDate.getMonth() === month && currentDate.getFullYear() === year;

                return (
                  <button 
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`
                      relative aspect-square flex items-center justify-center text-[11px] font-orbitron transition-all duration-300 rounded-xl
                      ${currentDay 
                        ? 'bg-system-accent text-system-bg-base shadow-[0_0_20px_var(--system-accent-glow)] font-bold' 
                        : isSelected 
                          ? 'bg-system-accent/20 border border-system-accent/40 text-system-accent' 
                          : 'hover:bg-system-accent/10 text-system-text-muted'}
                    `}
                  >
                    {day}
                    {filledCount > 0 && !currentDay && !isSelected && (
                      <div className="absolute bottom-1.5 w-1 h-1 bg-system-accent rounded-full animate-pulse shadow-[0_0_5px_var(--system-accent-glow)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <section id="timelog-contexts" className="bg-system-bg-panel-solid/95 p-8 rounded-[2.5rem] border border-system-accent/10 backdrop-blur-2xl relative shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-px bg-gradient-to-l from-system-accent/40 to-transparent" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[11px] font-orbitron text-system-text-muted uppercase tracking-[0.3em] flex items-center gap-2 opacity-60">
                <ICONS.Sword className="w-3.5 h-3.5" /> Matrix Contexts
              </h3>
              <button 
                onClick={() => { setIsAddingTag(true); setEditingTag({ id: Date.now().toString(), label: '', color: '#06b6d4', description: '' }); }}
                className="text-[9px] text-system-accent font-orbitron hover:underline tracking-widest transition-all"
              >
                + INITIALIZE
              </button>
            </div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {tagConfigs.map((data) => (
                <div key={data.id} className="flex gap-3">
                  <button
                    onClick={() => setSelectedTagId(data.id)}
                    className={`
                      flex-1 flex items-center gap-4 p-3 rounded-2xl border transition-all text-left relative overflow-hidden
                      ${selectedTagId === data.id ? 'bg-system-accent/15 border-system-accent/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' : 'bg-black/20 border-system-accent/5 opacity-60 hover:opacity-100 hover:bg-black/30'}
                    `}
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: data.color, color: data.color }} />
                    <div className="flex flex-col min-w-0">
                      <div className={`text-[11px] font-orbitron uppercase truncate tracking-widest ${selectedTagId === data.id ? 'text-system-accent' : 'text-system-text'}`}>{data.label}</div>
                      <div className="text-[8px] text-system-text-muted font-light truncate uppercase tracking-tighter opacity-60">{data.description || 'No description'}</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => { setIsAddingTag(false); setEditingTag(data); }}
                    className="p-3 bg-black/40 border border-system-accent/10 rounded-2xl text-system-text-muted hover:text-system-accent transition-all hover:bg-black/60"
                  >
                    <ICONS.Settings className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Autopsy Insight Section */}
          <div className="bg-system-bg-panel-solid/95 border border-system-accent/10 p-6 rounded-[2rem] flex items-start gap-5 backdrop-blur-2xl relative overflow-hidden shadow-lg">
             <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-system-accent/40 via-transparent to-system-accent/40" />
             <div className="p-3 bg-system-accent/10 rounded-2xl text-system-accent relative shrink-0">
               <ICONS.Info className="w-5 h-5" />
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-system-accent rounded-full animate-ping opacity-75"></div>
             </div>
             <div className="space-y-2">
               <h4 className="text-[10px] font-orbitron text-system-text-muted uppercase tracking-[0.3em] opacity-60">Systemic Autopsy</h4>
               <p className="text-xs text-system-accent font-light italic leading-relaxed opacity-90">
                 "{systemicAutopsy}"
               </p>
             </div>
          </div>
        </div>

        {/* Right Column: Vertical Timeline & Analytics */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-system-bg-panel p-8 rounded-sm border border-system-accent/20 shadow-2xl backdrop-blur-md relative min-h-[600px]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <h2 className="text-xl font-orbitron text-system-text tracking-[0.2em] uppercase">Chronological Flow</h2>
                <span className="text-[8px] font-orbitron text-system-accent/50 uppercase tracking-[0.5em] mt-1">
                  {currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <button 
                onClick={() => setConfirmClear({ type: 'day', key: `${year}-${month}-${currentDate.getDate()}` })}
                className="p-2 rounded-sm bg-red-500/5 border border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white transition-all hover-glitch"
              >
                <ICONS.Trash className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-12 space-y-2 max-h-[800px] overflow-y-auto custom-scrollbar pr-4">
              <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-system-accent/40 via-system-accent/10 to-system-accent/40" />
              
              {visibleHours.map((h) => {
                const dateKey = `${year}-${month}-${currentDate.getDate()}`;
                const blocks = timelog[dateKey] || {};
                const tagId = blocks[h];
                const config = tagConfigs.find(t => t.id === tagId);
                const isFilled = !!config;

                return (
                  <div key={h} className="relative flex items-center group py-1">
                    {/* Glowing Node */}
                    <div 
                      onClick={() => toggleBlock(currentDate.getDate(), h)}
                      className={`
                        absolute left-[-36px] w-3 h-3 rounded-full border transition-all duration-500 z-10 cursor-pointer hover-glitch
                        ${isFilled 
                          ? 'bg-system-accent border-system-accent shadow-[0_0_15px_var(--system-accent-glow)] scale-125' 
                          : 'bg-system-bg-base border-system-accent/30 group-hover:border-system-accent/60 hover:scale-110'}
                      `}
                    >
                      {isFilled && <div className="absolute inset-0 rounded-full animate-ping bg-system-accent/40" />}
                    </div>

                    <div className="flex items-center space-x-6 w-full">
                      <span className={`text-[10px] font-orbitron w-16 text-right transition-colors ${isFilled ? 'text-system-accent' : 'text-system-text-muted opacity-40'}`}>
                        {getHourLabel(h)}
                      </span>
                      
                      <button
                        onClick={() => toggleBlock(currentDate.getDate(), h)}
                        className={`
                          flex-1 p-3 rounded-sm border transition-all duration-300 text-left flex items-center justify-between group/btn relative overflow-hidden hover-glitch
                          ${isFilled 
                            ? 'bg-system-accent/5 border-system-accent/30 shadow-[0_0_20px_rgba(6,182,212,0.05)]' 
                            : 'bg-black/20 border-system-accent/5 hover:border-system-accent/20'}
                        `}
                      >
                        <AnimatePresence mode="wait">
                          {isFilled ? (
                            <motion.div 
                              key="filled"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center space-x-3"
                            >
                              <div className="w-1 h-4 bg-system-accent" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-orbitron text-system-accent uppercase tracking-widest">{config.label}</span>
                                <span className="text-[8px] text-system-text-muted font-light italic">{config.description || 'Active Engagement'}</span>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.span 
                              key="vacant"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.3 }}
                              className="text-[9px] font-orbitron text-system-text-muted uppercase tracking-[0.3em] ml-4"
                            >
                              Vacant Temporal Slot
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {isFilled && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-[8px] font-orbitron text-system-accent/40 uppercase tracking-tighter">Quest Accepted</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-system-accent animate-pulse shadow-[0_0_8px_var(--system-accent-glow)]" />
                          </motion.div>
                        )}
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-system-accent/5 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <section id="timelog-analytics" className="bg-system-bg-panel p-8 rounded-sm border border-system-accent/10 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-system-accent/20 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h3 className="text-xs font-orbitron text-system-text-muted uppercase tracking-[0.3em]">Systemic Analytics</h3>
                <span className="text-[8px] font-orbitron text-system-accent/40 uppercase tracking-widest mt-1">Efficiency Metrics & Distribution</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-black/40 p-1 rounded-sm border border-system-accent/20">
                  <button onClick={() => setPlotType('density')} className={`px-4 py-1.5 rounded-sm text-[8px] font-orbitron uppercase transition-all hover-glitch ${plotType === 'density' ? 'bg-system-accent text-system-bg-base' : 'text-system-text-muted hover:text-system-accent'}`}>Density</button>
                  <button onClick={() => setPlotType('distribution')} className={`px-4 py-1.5 rounded-sm text-[8px] font-orbitron uppercase transition-all hover-glitch ${plotType === 'distribution' ? 'bg-system-accent text-system-bg-base' : 'text-system-text-muted hover:text-system-accent'}`}>Split</button>
                </div>
                <div className="flex bg-black/40 p-1 rounded-sm border border-system-accent/20">
                  {(['day', 'week', 'month', 'year'] as TimeScale[]).map(scale => (
                    <button 
                      key={scale}
                      onClick={() => setTimeScale(scale)}
                      className={`px-3 py-1.5 rounded-sm text-[8px] font-orbitron uppercase transition-all hover-glitch ${timeScale === scale ? 'text-system-accent' : 'text-system-text-muted hover:text-system-accent'}`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {plotType === 'density' ? (
              <div id="timelog-heatmap" className="space-y-2">
                {visibleHours.map((h) => {
                  const data = heatmapData[h];
                  const maxTotal = Math.max(...heatmapData.map(d => d.total), 1);
                  const barWidth = (data.total / maxTotal) * 100;
                  
                  let gradientParts: string[] = [];
                  let currentPos = 0;
                  Object.entries(data.tags).forEach(([tagId, count]) => {
                    const config = tagConfigs.find(t => t.id === tagId);
                    const c = count as number;
                    if (config && c > 0 && data.total > 0) {
                      const percentage = (c / data.total) * 100;
                      gradientParts.push(`${config.color} ${currentPos}%`);
                      currentPos += percentage;
                      gradientParts.push(`${config.color} ${currentPos}%`);
                    }
                  });

                  return (
                    <div key={h} className="flex items-center gap-3 group">
                      <span className="text-[8px] font-orbitron text-system-text-muted w-8 text-right group-hover:text-system-accent transition-colors">{getHourLabel(h)}</span>
                      <div className="flex-1 h-2.5 bg-black/20 rounded-full overflow-hidden border border-system-accent/10 relative">
                        <div 
                          className="h-full transition-all duration-700" 
                          style={{ width: `${barWidth}%`, background: gradientParts.length > 0 ? `linear-gradient(to right, ${gradientParts.join(', ')})` : 'transparent' }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in">
                {tagConfigs.map((info) => {
                  const count = distributionData.counts[info.id] || 0;
                  const total = distributionData.total;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={info.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-orbitron uppercase tracking-widest text-system-text-muted">
                        <span>{info.label}</span>
                        <span className="text-system-text">{Math.round(percentage)}% ({count}h)</span>
                      </div>
                      <div className="h-1.5 bg-black/40 rounded-full border border-system-accent/10 overflow-hidden">
                        <div className="h-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: info.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </>
    )}
  </div>

      {/* Productivity Pulse Chart */}
      {viewMode === 'flow' && (
        <section id="timelog-pulse" className="bg-system-bg-panel-solid/95 p-10 rounded-[3rem] border border-system-accent/10 backdrop-blur-2xl space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h3 className="text-base font-orbitron text-system-text-muted uppercase tracking-[0.4em] flex items-center gap-3 opacity-60">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                Productivity Pulse
              </h3>
              <div className="flex bg-black/40 p-1 rounded-xl border border-system-accent/10 backdrop-blur-md">
                {(['day', 'week', 'month', 'year'] as TimeScale[]).map(scale => (
                  <button 
                    key={scale}
                    onClick={() => setPulseScale(scale)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-orbitron uppercase transition-all ${pulseScale === scale ? 'bg-system-accent text-system-bg-base shadow-lg' : 'text-system-text-muted hover:text-system-text'}`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] font-orbitron text-system-accent uppercase tracking-[0.3em] system-glow">
              {pulseScale === 'day' ? 'Hourly Activity' : pulseScale === 'year' ? 'Monthly Output' : 'Daily Output'}
            </div>
          </div>

          <div className="h-[350px] w-full bg-black/20 rounded-[2rem] p-6 border border-system-accent/5">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={productivityPulseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 157, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="var(--system-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--system-text-muted)', fontStyle: 'italic', opacity: 0.5 }}
                />
                <YAxis 
                  stroke="var(--system-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--system-text-muted)', opacity: 0.5 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 255, 157, 0.05)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length && payload[0].value > 0) {
                      return (
                        <div className="bg-black/80 backdrop-blur-xl border border-system-accent/30 p-4 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest">{label}</p>
                          <p className="text-xl font-orbitron text-system-accent system-glow">{payload[0].value}h</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="hours" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={2000}
                >
                  {productivityPulseData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.hours > 0 ? 'var(--system-accent)' : 'transparent'} 
                      fillOpacity={entry.hours > 0 ? 0.8 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-black/40 p-6 rounded-[2rem] border border-system-accent/10 backdrop-blur-md shadow-lg group hover:border-system-accent/30 transition-all">
              <div className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest opacity-60">Total Output</div>
              <div className="text-3xl font-orbitron text-system-accent system-glow">
                {productivityPulseData.reduce((acc, curr) => acc + curr.hours, 0)}<span className="text-sm ml-1 opacity-60">H</span>
              </div>
            </div>
            <div className="bg-black/40 p-6 rounded-[2rem] border border-system-accent/10 backdrop-blur-md shadow-lg group hover:border-system-accent/30 transition-all">
              <div className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest opacity-60">Peak Performance</div>
              <div className="text-3xl font-orbitron text-emerald-400">
                {Math.max(...productivityPulseData.map(d => d.hours))}<span className="text-sm ml-1 opacity-60">H</span>
              </div>
            </div>
            <div className="bg-black/40 p-6 rounded-[2rem] border border-system-accent/10 backdrop-blur-md shadow-lg group hover:border-system-accent/30 transition-all">
              <div className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest opacity-60">Average Intensity</div>
              <div className="text-3xl font-orbitron text-indigo-400">
                {(productivityPulseData.reduce((acc, curr) => acc + curr.hours, 0) / productivityPulseData.length).toFixed(1)}<span className="text-sm ml-1 opacity-60">H</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Neural Activity Trend Graph */}
      <section id="timelog-trend" className="bg-system-bg-panel-solid/95 p-10 rounded-[3rem] border border-system-accent/10 backdrop-blur-2xl space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-system-accent/30 to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h3 className="text-base font-orbitron text-system-text-muted uppercase tracking-[0.4em] flex items-center gap-3 opacity-60">
              <ICONS.Activity className="w-5 h-5 text-system-accent" />
              Neural Activity Trend
            </h3>
            <div className="flex bg-black/40 p-1 rounded-xl border border-system-accent/10 backdrop-blur-md">
              {(['day', 'week', 'month', 'year'] as TimeScale[]).map(scale => (
                <button 
                  key={scale}
                  onClick={() => setTrendScale(scale)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-orbitron uppercase transition-all ${trendScale === scale ? 'bg-system-accent text-system-bg-base shadow-lg' : 'text-system-text-muted hover:text-system-text'}`}
                >
                  {scale === 'day' ? 'Days' : scale === 'week' ? 'Weeks' : scale === 'month' ? 'Months' : 'Years'}
                </button>
              ))}
            </div>
            <div className="flex bg-black/40 p-1 rounded-xl border border-system-accent/10 backdrop-blur-md ml-2">
              <button 
                onClick={() => setTrendType('area')}
                className={`p-2 rounded-lg transition-all ${trendType === 'area' ? 'bg-system-accent text-system-bg-base shadow-lg' : 'text-system-text-muted hover:text-system-text'}`}
                title="Area Chart"
              >
                <ICONS.Activity className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTrendType('bar')}
                className={`p-2 rounded-lg transition-all ${trendType === 'bar' ? 'bg-system-accent text-system-bg-base shadow-lg' : 'text-system-text-muted hover:text-system-text'}`}
                title="Bar Chart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[11px] font-orbitron text-system-accent uppercase tracking-[0.3em] system-glow">
              {trendScale === 'day' ? 'Daily Velocity' : trendScale === 'week' ? 'Weekly Momentum' : trendScale === 'month' ? 'Monthly Output' : 'Yearly Growth'}
            </div>
            <div className="text-[8px] font-orbitron text-system-text-muted uppercase tracking-widest opacity-40 mt-1">
              Historical Performance Tracking
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full bg-black/20 rounded-[2rem] p-6 border border-system-accent/5 relative">
          <ResponsiveContainer width="100%" height="100%">
            {trendType === 'area' ? (
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--system-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--system-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="var(--system-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--system-text-muted)', fontStyle: 'italic', opacity: 0.5 }}
                />
                <YAxis 
                  stroke="var(--system-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--system-text-muted)', opacity: 0.5 }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/80 backdrop-blur-xl border border-system-accent/30 p-4 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest">{label}</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-orbitron text-system-accent system-glow">{payload[0].value}</p>
                            <span className="text-[10px] font-orbitron text-system-accent/60 uppercase">Hours</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="var(--system-accent)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                  animationDuration={1500}
                />
              </AreaChart>
            ) : (
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="var(--system-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--system-text-muted)', fontStyle: 'italic', opacity: 0.5 }}
                />
                <YAxis 
                  stroke="var(--system-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--system-text-muted)', opacity: 0.5 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(6, 182, 212, 0.05)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/80 backdrop-blur-xl border border-system-accent/30 p-4 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest">{label}</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-orbitron text-system-accent system-glow">{payload[0].value}</p>
                            <span className="text-[10px] font-orbitron text-system-accent/60 uppercase">Hours</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="hours" 
                  fill="var(--system-accent)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                >
                  {trendData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          <div className="bg-black/40 p-6 rounded-[2rem] border border-system-accent/10 backdrop-blur-md shadow-lg group hover:border-system-accent/30 transition-all">
            <div className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest opacity-60">Period Total</div>
            <div className="text-3xl font-orbitron text-system-accent system-glow">
              {trendData.reduce((acc, curr) => acc + curr.hours, 0)}<span className="text-sm ml-1 opacity-60">H</span>
            </div>
          </div>
          <div className="bg-black/40 p-6 rounded-[2rem] border border-system-accent/10 backdrop-blur-md shadow-lg group hover:border-system-accent/30 transition-all">
            <div className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest opacity-60">Highest Peak</div>
            <div className="text-3xl font-orbitron text-emerald-400">
              {Math.max(...trendData.map(d => d.hours), 0)}<span className="text-sm ml-1 opacity-60">H</span>
            </div>
          </div>
          <div className="bg-black/40 p-6 rounded-[2rem] border border-system-accent/10 backdrop-blur-md shadow-lg group hover:border-system-accent/30 transition-all">
            <div className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest opacity-60">Average Flow</div>
            <div className="text-3xl font-orbitron text-indigo-400">
              {(trendData.reduce((acc, curr) => acc + curr.hours, 0) / (trendData.length || 1)).toFixed(1)}<span className="text-sm ml-1 opacity-60">H</span>
            </div>
          </div>
          <div className="bg-black/40 p-6 rounded-[2rem] border border-system-accent/10 backdrop-blur-md shadow-lg group hover:border-system-accent/30 transition-all">
            <div className="text-[10px] font-orbitron text-system-text-muted uppercase mb-2 tracking-widest opacity-60">Consistency</div>
            <div className="text-3xl font-orbitron text-amber-400">
              {Math.round((trendData.filter(d => d.hours > 0).length / (trendData.length || 1)) * 100)}<span className="text-sm ml-1 opacity-60">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tag Editor Modal */}
      {editingTag && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-system-bg-panel border border-system-accent/30 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar system-border-glow">
            <h3 className="text-lg font-orbitron text-system-accent uppercase tracking-widest">{isAddingTag ? 'New Context' : 'Edit Context'}</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-orbitron text-system-text-muted uppercase tracking-widest ml-1">Context Label</label>
                <input 
                  type="text" 
                  placeholder="Label" 
                  value={editingTag.label ?? ''} 
                  onChange={e => setEditingTag({...editingTag, label: e.target.value})}
                  className="w-full bg-black/40 border border-system-accent/20 rounded-xl px-4 py-2.5 text-sm text-system-text font-orbitron focus:border-system-accent/50 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-orbitron text-system-text-muted uppercase tracking-widest ml-1">Neural Description</label>
                <textarea 
                  placeholder="Description" 
                  value={editingTag.description ?? ''} 
                  onChange={e => setEditingTag({...editingTag, description: e.target.value})}
                  className="w-full bg-black/40 border border-system-accent/20 rounded-xl px-4 py-2.5 text-xs text-system-text-muted h-20 resize-none focus:border-system-accent/50 transition-all outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-orbitron text-system-text-muted mb-3 block uppercase tracking-widest ml-1">Spectral Signature</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map(c => (
                    <button 
                      key={c}
                      onClick={() => setEditingTag({...editingTag, color: c})}
                      className={`aspect-square rounded-lg border-2 transition-all hover-glitch ${editingTag.color === c ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button onClick={() => handleSaveTag(editingTag)} className="w-full py-3.5 bg-system-accent text-system-bg-base font-orbitron text-[10px] font-bold tracking-[0.2em] rounded-xl hover:bg-system-accent/80 hover-glitch shadow-lg shadow-system-accent/20 transition-all">AUTHORIZE CHANGES</button>
              {!isAddingTag && (
                <button onClick={() => handleDeleteTag(editingTag.id)} className="text-red-400 text-[9px] font-orbitron uppercase py-2 hover:text-red-300 transition-colors tracking-widest">Purge Context</button>
              )}
              <button onClick={() => setEditingTag(null)} className="text-system-text-muted text-[9px] font-orbitron uppercase py-2 hover:text-white transition-colors tracking-widest">Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modals */}
      {confirmClear && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-system-bg-panel border border-red-500/50 p-8 rounded-3xl max-w-sm w-full shadow-2xl space-y-6 text-center max-h-[90vh] overflow-y-auto custom-scrollbar system-border-glow">
            <div className="p-3 bg-red-500/10 rounded-full w-fit mx-auto text-red-400"><ICONS.Trash /></div>
            <h3 className="text-lg font-orbitron text-system-text uppercase tracking-widest">Authorize Purge</h3>
            <p className="text-xs text-system-text-muted font-light">Confirm irreversible data removal.</p>
            <div className="flex flex-col space-y-3">
              <button onClick={() => confirmClear.type === 'day' ? handleClearDay(confirmClear.key!) : handleClearMonth()} className="w-full py-3.5 bg-red-500 text-white font-orbitron text-[10px] font-bold tracking-[0.2em] rounded-xl hover-glitch shadow-lg shadow-red-500/20">CONFIRM</button>
              <button onClick={() => setConfirmClear(null)} className="w-full py-3.5 bg-black/40 text-system-text-muted font-orbitron text-[10px] font-bold tracking-[0.2em] rounded-xl border border-system-accent/20 hover-glitch">ABORT</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

export default TimelogPage;
