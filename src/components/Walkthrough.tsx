import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  Info, 
  Target, 
  Zap, 
  Brain, 
  Activity,
  BarChart3,
  Clock,
  Trophy,
  Plus,
  Shield,
  Star,
  Settings
} from 'lucide-react';

import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';

interface Step {
  title: string;
  content: string;
  targetId?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  page?: string;
  tab?: 'recurring' | 'one-off' | 'recent-history' | 'log';
  viewMode?: 'calendar' | 'flow';
  action?: () => void;
  icon?: React.ReactNode;
}

interface WalkthroughProps {
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const Walkthrough: React.FC<WalkthroughProps> = ({ onClose, onNavigate }) => {
  const { setQuestsTab, setTimelogViewMode } = usePlayerStore(useShallow(state => ({
    setQuestsTab: state.setQuestsTab,
    setTimelogViewMode: state.setTimelogViewMode
  })));
  const [currentStep, setCurrentStep] = useState(0);
  const [hasTarget, setHasTarget] = useState(false);
  const [isChangingStep, setIsChangingStep] = useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const lastPage = useRef<string | undefined>(undefined);
  
  // Motion values for the traveling highlight
  const highlightTop = useMotionValue(0);
  const highlightLeft = useMotionValue(0);
  const highlightWidth = useMotionValue(0);
  const highlightHeight = useMotionValue(0);
  const highlightRadius = useMotionValue('0px');
  const highlightOpacity = useMotionValue(0);
  const hasEverHadTarget = useRef(false);
  const lastTargetId = useRef<string | null>(null);
  const lastRect = useRef<{ top: number; left: number; width: number; height: number } | null>(null);
  const lastRadius = useRef<string | null>(null);

  const steps: Step[] = useMemo(() => [
    {
      title: "Welcome to the System",
      content: "Greetings, Player. You have been granted access to the Neural Interface. This walkthrough will guide you through the core protocols of your evolution.",
      targetId: "dashboard-header",
      position: 'bottom',
      page: 'landing',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    // DASHBOARD
    {
      title: "The Dashboard",
      content: "This is your central command. From here, you can access all system modules: Status, Skills, Quests, Jobs, and the Chronicle.",
      targetId: "dashboard-nav",
      position: 'bottom',
      page: 'landing',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Ability Scores",
      content: "Your core attributes are cataloged here. These scores represent physical and mental capacities, upgraded through direct real-world training and logging hours.",
      targetId: "dashboard-stats",
      position: 'bottom',
      page: 'landing',
      icon: <Star className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Top Skills",
      content: "Your highest-level skills are highlighted here. Focus on these to maximize your core attributes.",
      targetId: "dashboard-skills",
      position: 'bottom',
      page: 'landing',
      icon: <Brain className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Active Classes",
      content: "Monitor your active career and life roles. Levels earned in classes translate directly to permanent stat increases and synergistic effects.",
      targetId: "dashboard-jobs",
      position: 'bottom',
      page: 'landing',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Active Directives",
      content: "Your most pressing quests are displayed here. Complete them to earn stat points and maintain your momentum.",
      targetId: "dashboard-quests",
      position: 'bottom',
      page: 'landing',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "System Notification",
      content: "The system provides real-time advice and insights here. Pay attention to these directives to optimize your growth path.",
      targetId: "dashboard-advice",
      position: 'bottom',
      page: 'landing',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Status Protocol",
      content: "This is your core identity matrix. Here you can monitor your rank, level, and overall system progression.",
      targetId: "nav-status",
      position: 'top',
      page: 'landing',
      icon: <Shield className="w-6 h-6 text-system-accent" />
    },
    // STATUS PAGE
    {
      title: "Neural Rank",
      content: "Your Rank is a visual representation of your total mastery. Higher ranks unlock advanced system features.",
      targetId: "status-rank-card",
      position: 'right',
      page: 'status',
      icon: <Star className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Level Projection",
      content: "Monitor your current level and experience progress. Use the simulation slider to project your future growth.",
      targetId: "status-level-panel",
      position: 'left',
      page: 'status',
      icon: <Activity className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Equipped Matrix",
      content: "Manage your active Jobs, Titles, and Beliefs. These define your current 'Class' and provide active bonuses.",
      targetId: "status-equipped",
      position: 'right',
      page: 'status',
      icon: <Brain className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Attribute Matrix",
      content: "The radar chart visualizes your stat distribution. Balance your attributes to optimize your systemic synergy.",
      targetId: "status-radar",
      position: 'left',
      page: 'status',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "System Identity",
      content: "Customize your designation and monitor your active title. Titles provide significant stat boosts and unique effects.",
      targetId: "status-username-input",
      position: 'bottom',
      page: 'status',
      icon: <Shield className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Archive System",
      content: "Access your collection of unlocked Titles and Beliefs. You can search and manage your historical achievements here.",
      targetId: "status-archive-system",
      position: 'bottom',
      page: 'status',
      icon: <Shield className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Synergy Storage",
      content: "Review all active and passive effects currently influencing your system. Synergies are the key to peak performance.",
      targetId: "status-synergy-storage",
      position: 'bottom',
      page: 'status',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    // SKILLS PAGE
    {
      title: "Skill Repository",
      content: "Skills are the building blocks of your power. Log hours into skills to gain experience and increase your core stats.",
      targetId: "nav-skills",
      position: 'top',
      page: 'landing',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Skill List",
      content: "Here are your active skills. Click on any skill to view its details, log hours, and manage its stat rewards.",
      targetId: "skills-list",
      position: 'right',
      page: 'skills',
      icon: <Activity className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Adding New Skills",
      content: "Use the '+' button to initialize a new skill. Define its type and the stats it should reward upon leveling up.",
      targetId: "skills-add-btn",
      position: 'left',
      page: 'skills',
      icon: <Plus className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Folders & Organization",
      content: "Organize your skills into folders to keep your interface clean. You can toggle between list and folder views here.",
      targetId: "skills-folder-btn",
      position: 'bottom',
      page: 'skills',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Neural Database Search",
      content: "Filter your skills by name or neural signature using the search matrix. Locate specific training data instantly.",
      targetId: "skills-search",
      position: 'bottom',
      page: 'skills',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Skill Analytics",
      content: "Analyze your skill growth over time. The system tracks your consistency and provides a visual representation of your mastery.",
      targetId: "skills-analytics-toggle",
      position: 'top',
      page: 'skills',
      icon: <BarChart3 className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Neural Purge",
      content: "If you need to reset your progress for this sector, use the Purge button located at the bottom of each skill's details page. Warning: This action is irreversible.",
      targetId: "skills-purge-btn",
      position: 'top',
      page: 'skills',
      icon: <X className="w-6 h-6 text-red-400" />
    },
    // JOBS PAGE
    {
      title: "Job Classifications",
      content: "Jobs represent your professional path. They offer significant stat boosts and unique effects as you level them up.",
      targetId: "nav-jobs",
      position: 'top',
      page: 'landing',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Job Selection",
      content: "You can equip one primary job. Leveling a job requires dedicated time and effort, rewarding you with permanent stat increases.",
      targetId: "jobs-list",
      position: 'right',
      page: 'jobs',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Initialize Job",
      content: "Use this to create a new Job class. Define its title and neural signature to begin tracking progress.",
      targetId: "jobs-add-btn",
      position: 'left',
      page: 'jobs',
      icon: <Plus className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Neural Search",
      content: "Quickly filter through your neural classes using the search matrix. Locate specific evolution paths instantly.",
      targetId: "jobs-search",
      position: 'bottom',
      page: 'jobs',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Job Analytics",
      content: "Toggle this panel to view your mastery distribution and evolution efficiency across all your jobs.",
      targetId: "jobs-analytics",
      position: 'bottom',
      page: 'jobs',
      icon: <BarChart3 className="w-6 h-6 text-system-accent" />
    },
    // QUESTS PAGE
    {
      title: "Quest Nexus",
      content: "Quests are your daily directives. Complete them to earn stat points and maintain your momentum.",
      targetId: "nav-quests",
      position: 'top',
      page: 'landing',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Active Directives",
      content: "Here are your current quests. Complete them to earn stat points and maintain your momentum.",
      targetId: "quests-list",
      position: 'right',
      page: 'quests',
      tab: 'recurring',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Quest Types",
      content: "Recurring quests help build habits with streaks, while One-Off quests are for specific objectives. Use the tabs to navigate your directives.",
      targetId: "quests-tabs",
      position: 'bottom',
      page: 'quests',
      icon: <Activity className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Quest Creation",
      content: "Initialize new directives here. You can set the difficulty, rewards, and penalties for each quest.",
      targetId: "quests-add-btn",
      position: 'left',
      page: 'quests',
      tab: 'recurring',
      icon: <Plus className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Directive Search",
      content: "Quickly locate specific directives using the search matrix. Filter by title or objective keywords.",
      targetId: "quests-search",
      position: 'bottom',
      page: 'quests',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "System Log",
      content: "The System Log maintains a permanent record of every directive outcome, successful or otherwise.",
      targetId: "quests-log-tab",
      position: 'bottom',
      page: 'quests',
      tab: 'log',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Chronicle of Actions",
      content: "Review your past performance in detail. Each entry represents a completed or failed directive.",
      targetId: "quests-log-container",
      position: 'top',
      page: 'quests',
      tab: 'log',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Log Entry",
      content: "Each log entry shows the quest title, timestamp, and outcome. You can edit the title of recent entries if needed.",
      targetId: "quests-log-entry",
      position: 'bottom',
      page: 'quests',
      tab: 'log',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    // TIMELOG PAGE
    {
      title: "The Chronicle",
      content: "The Timelog is your historical record. It tracks how you allocate your most precious resource: Time.",
      targetId: "nav-timelog",
      position: 'top',
      page: 'landing',
      icon: <Clock className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Temporal Calendar",
      content: "Select a day to view or log your activities. The system highlights days with recorded neural activity.",
      targetId: "timelog-calendar",
      position: 'right',
      page: 'timelog',
      icon: <Clock className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Calendar View",
      content: "Switch to the Calendar view to see your daily time allocation in a structured grid format.",
      targetId: "timelog-view-toggle",
      position: 'bottom',
      page: 'timelog',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Flow View",
      content: "Switch to the Flow view to see your activity patterns over time, highlighting your most productive periods.",
      targetId: "timelog-view-toggle",
      position: 'bottom',
      page: 'timelog',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Matrix Contexts",
      content: "Categorize your time using Contexts. This allows the system to perform a 'Systemic Autopsy' on your progress.",
      targetId: "timelog-contexts",
      position: 'left',
      page: 'timelog',
      icon: <Brain className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Productivity Pulse",
      content: "This chart visualizes your activity intensity. High bars indicate peak performance windows.",
      targetId: "timelog-pulse",
      position: 'bottom',
      page: 'timelog',
      viewMode: 'flow',
      icon: <BarChart3 className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Time Allocation",
      content: "The heatmap shows your daily distribution. Use this to ensure you are spending enough time on your primary objectives.",
      targetId: "timelog-analytics",
      position: 'bottom',
      page: 'timelog',
      viewMode: 'flow',
      icon: <Clock className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Activity Trend",
      content: "Monitor your neural activity trends over long periods. Identify growth patterns and consistency levels.",
      targetId: "timelog-trend",
      position: 'bottom',
      page: 'timelog',
      viewMode: 'flow',
      icon: <Activity className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Temporal Purge",
      content: "Clear your log data for the current period if you need a fresh start. Use with caution.",
      targetId: "timelog-purge-btn",
      position: 'bottom',
      page: 'timelog',
      icon: <X className="w-6 h-6 text-red-400" />
    },
    // SYSTEM MENU
    {
      title: "System Menu",
      content: "The System Menu is your central hub for configuration. From here, you can access the System Manual, replay this Guide, and adjust your interface settings.",
      targetId: "nav-settings",
      position: 'top',
      page: 'landing',
      icon: <Settings className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Guide Mode",
      content: "If you ever need to review these protocols again, you can restart Guide Mode from here.",
      targetId: "system-menu-guide-btn",
      position: 'top',
      page: 'landing',
      icon: <Play className="w-6 h-6 text-system-accent" />
    },
    {
      title: "System Manual",
      content: "This is where you access the System Manual for a deep dive into the mechanics of your evolution. It covers everything from stat formulas to data integrity.",
      targetId: "system-menu-manual-btn",
      position: 'top',
      page: 'landing',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    // INSTRUCTIONS PAGE
    {
      title: "Neural Documentation",
      content: "Review the core directives and operational protocols. Knowledge is the first step toward transcendence.",
      targetId: "instructions-content",
      position: 'bottom',
      page: 'instructions',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    // CONCLUSION
    {
      title: "System Ready",
      content: "You are now familiar with the core protocols. Start by creating your first Skill and Job, then set your daily Quests. Evolution awaits.",
      position: 'center',
      page: 'landing',
      icon: <Play className="w-6 h-6 text-system-accent" />
    }
  ], []);

  const hasScrolledForStep = useRef<number>(-1);

  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('close-system-menu'));
    };
  }, []);

  useEffect(() => {
    const step = steps[currentStep];
    const pageChanged = step.page !== lastPage.current;
    
    if (pageChanged && lastPage.current !== undefined) {
      setIsChangingStep(true);
      // Sufficient time for page mount and content render
      const timer = setTimeout(() => setIsChangingStep(false), 500);
      lastPage.current = step.page;
      return () => clearTimeout(timer);
    }
    
    lastPage.current = step.page;
  }, [currentStep, steps]);

  useEffect(() => {
    const step = steps[currentStep];
    if (step.page) {
      onNavigate(step.page);
    }
    if (step.tab) {
      setQuestsTab(step.tab);
    }
    if (step.viewMode) {
      setTimelogViewMode(step.viewMode);
    }
    
    // Open system menu if we need to highlight something inside it
    if (step.targetId === 'system-menu-guide-btn' || step.targetId === 'system-menu-manual-btn') {
      window.dispatchEvent(new CustomEvent('open-system-menu'));
    } else {
      window.dispatchEvent(new CustomEvent('close-system-menu'));
    }
  }, [currentStep, steps, onNavigate]);

  const getTargetElement = (targetId: string | undefined) => {
    if (!targetId) return null;
    
    const getVisibleElement = (ids: string[]) => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getClientRects().length > 0) return el;
      }
      return null;
    };

    if (targetId.startsWith('nav-')) {
      const type = targetId.split('-')[1];
      return getVisibleElement([targetId, `nav-mobile-${type}`]);
    }

    if (targetId === 'status-radar') {
      return getVisibleElement(['status-radar', 'status-radar-tablet', 'status-radar-mobile']);
    }

    if (targetId === 'dashboard-nav') {
      return getVisibleElement(['desktop-nav', 'mobile-nav']);
    }

    return getVisibleElement([targetId]);
  };

  // Calculate panel position whenever targetRect or currentStep changes
  useEffect(() => {
    let rafId: number;

    const calculatePosition = () => {
      // Re-fetch target rect on every calculation to handle resizes
      const step = steps[currentStep];
      let currentTargetRect = null;
      
      if (step.targetId) {
        const el = getTargetElement(step.targetId);
        if (el) {
          if (hasScrolledForStep.current !== currentStep) {
            hasScrolledForStep.current = currentStep;
            let scrollBlock: ScrollLogicalPosition = 'center';
            if (step.position === 'top') {
              scrollBlock = 'end';
            } else if (step.position === 'bottom' || step.targetId === 'timelog-calendar' || step.targetId === 'status-synergy-storage' || step.targetId === 'status-archive-system') {
              // If we're placing the panel at the bottom, or if it's a tall element where we only highlight the top,
              // we want to make sure the top of the element is visible.
              scrollBlock = 'start';
            }
            
            // Temporarily add scroll-margin-top to account for the top nav and center the top part
            const originalScrollMarginTop = el.style.scrollMarginTop;
            // Use a larger margin for tall elements to center their top section
            el.style.scrollMarginTop = (step.targetId === 'status-synergy-storage' || step.targetId === 'status-archive-system' || step.targetId === 'timelog-calendar' || step.targetId === 'timelog-pulse' || step.targetId === 'timelog-analytics' || step.targetId === 'timelog-trend' || step.targetId === 'instructions-content') ? '150px' : '100px';
            
            el.scrollIntoView({ behavior: 'smooth', block: scrollBlock });
            
            // Restore original scroll margin after a short delay to allow scroll to complete
            setTimeout(() => {
              if (el) el.style.scrollMarginTop = originalScrollMarginTop;
            }, 1000);
          }

          let rect = el.getBoundingClientRect();
          
          if (step.targetId === 'status-synergy-storage' || step.targetId === 'status-archive-system' || step.targetId === 'timelog-calendar' || step.targetId === 'instructions-content') {
            const maxHeight = step.targetId === 'timelog-calendar' ? Math.min(rect.height, 320) : step.targetId === 'instructions-content' ? Math.min(rect.height, 300) : Math.min(rect.height, 350);
            currentTargetRect = {
              top: rect.top,
              left: rect.left,
              right: rect.right,
              bottom: rect.top + maxHeight,
              width: rect.width,
              height: maxHeight,
              x: rect.x,
              y: rect.y,
              toJSON: () => {}
            } as DOMRect;
          } else {
            currentTargetRect = rect;
          }

          const style = window.getComputedStyle(el);
          const borderRadius = style.borderRadius;
          
          // Add a small padding to the highlight box for better visual breathing room
          const highlightPadding = 4;
          const targetTop = currentTargetRect.top - highlightPadding;
          const targetLeft = currentTargetRect.left - highlightPadding;
          const targetWidth = currentTargetRect.width + (highlightPadding * 2);
          const targetHeight = currentTargetRect.height + (highlightPadding * 2);
          
          const isResize = !lastRect.current || 
            Math.abs(lastRect.current.width - targetWidth) > 0.5 ||
            Math.abs(lastRect.current.height - targetHeight) > 0.5;

          const rectChanged = isResize || 
            Math.abs(lastRect.current.top - targetTop) > 0.5 ||
            Math.abs(lastRect.current.left - targetLeft) > 0.5;
            
          const radiusChanged = lastRadius.current !== borderRadius;
          const targetIdChanged = lastTargetId.current !== step.targetId;

          // Check if we are in a step transition, specifically for page changes
          if (isChangingStep) {
            highlightOpacity.stop();
            highlightOpacity.set(0);
            if (targetIdChanged) {
              // Snap to new position while invisible to avoid sliding across screen
              highlightTop.set(targetTop);
              highlightLeft.set(targetLeft);
              highlightWidth.set(targetWidth);
              highlightHeight.set(targetHeight);
              highlightRadius.set(borderRadius);
            }
            rafId = requestAnimationFrame(calculatePosition);
            return;
          }

          if (!hasEverHadTarget.current) {
            hasEverHadTarget.current = true;
            setHasTarget(true);
            // Instant snap on very first target
            highlightTop.set(targetTop);
            highlightLeft.set(targetLeft);
            highlightWidth.set(targetWidth);
            highlightHeight.set(targetHeight);
            highlightRadius.set(borderRadius);
            animate(highlightOpacity, 1, { duration: 0.3 });
          } else if (targetIdChanged || rectChanged || radiusChanged) {
            setHasTarget(true);
            // Smooth transition for subsequent targets or when target moves/resizes
            const transition = { type: 'spring', damping: 25, stiffness: 200 } as const;
            
            // Animate if step changed or element resized. Snap if just scrolling.
            if (targetIdChanged || isResize) {
              animate(highlightTop, targetTop, transition);
              animate(highlightLeft, targetLeft, transition);
              animate(highlightWidth, targetWidth, transition);
              animate(highlightHeight, targetHeight, transition);
              animate(highlightRadius, borderRadius as string, transition);
              animate(highlightOpacity, 1, { duration: 0.2 });
            } else {
              // Sticky follow for scroll
              highlightTop.stop();
              highlightLeft.stop();
              highlightWidth.stop();
              highlightHeight.stop();
              highlightRadius.stop();
              
              highlightTop.set(targetTop);
              highlightLeft.set(targetLeft);
              // Ensure width/height are correct in case an animation was interrupted
              highlightWidth.set(targetWidth);
              highlightHeight.set(targetHeight);
              highlightRadius.set(borderRadius);
              highlightOpacity.set(1);
            }
          }
          
          lastRect.current = {
            top: targetTop,
            left: targetLeft,
            width: targetWidth,
            height: targetHeight
          };
          lastRadius.current = borderRadius;
          lastTargetId.current = step.targetId || null;
        } else {
          if (hasTarget) {
            setHasTarget(false);
            animate(highlightOpacity, 0, { duration: 0.3 });
            lastTargetId.current = null;
          }
        }
      } else {
        if (hasTarget) {
          setHasTarget(false);
          animate(highlightOpacity, 0, { duration: 0.3 });
          lastTargetId.current = null;
        }
      }

      if (!panelRef.current) {
        rafId = requestAnimationFrame(calculatePosition);
        return;
      }

      const isMobile = window.innerWidth < 768;
      const panel = panelRef.current;
      
      // Reset styles that might have been set in previous frames or mobile view
      panel.style.width = '';
      panel.style.maxWidth = '';
      panel.style.height = '';
      panel.style.maxHeight = '';

      const panelRect = panel.getBoundingClientRect();
      const padding = isMobile ? 16 : 24;
      const screenPadding = isMobile ? 16 : 20;

      // Centering logic: If no target or position is center, let flexbox handle it
      if (!currentTargetRect || step.position === 'center' || isChangingStep) {
        panel.style.position = 'fixed';
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.bottom = 'auto';
        panel.style.right = 'auto';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.margin = '0';
        rafId = requestAnimationFrame(calculatePosition);
        return;
      }

      // Mobile specific: Fixed bottom or top to avoid overlap
      if (isMobile) {
        panel.style.position = 'fixed';
        panel.style.left = `${screenPadding}px`;
        panel.style.width = `calc(100% - ${screenPadding * 2}px)`;
        panel.style.maxWidth = 'none';
        
        // If the target starts in the top half of the screen, put the panel at the bottom
        // to avoid covering the title/header of the section.
        if (currentTargetRect.top < window.innerHeight * 0.4) {
          panel.style.top = 'auto';
          panel.style.bottom = '8%';
        } else if (currentTargetRect.bottom > window.innerHeight * 0.6) {
          panel.style.bottom = 'auto';
          panel.style.top = '20%';
        } else {
          // Target is in the middle, put panel at the bottom but slightly higher
          panel.style.top = 'auto';
          panel.style.bottom = '5%';
        }
        
        panel.style.transform = 'none';
        panel.style.margin = '0';
        rafId = requestAnimationFrame(calculatePosition);
        return;
      }

      let top = 0;
      let left = 0;

      // Initial desired position relative to target
      switch (step.position) {
        case 'top':
          top = currentTargetRect.top - panelRect.height - padding;
          left = currentTargetRect.left + currentTargetRect.width / 2 - panelRect.width / 2;
          break;
        case 'bottom':
          top = currentTargetRect.bottom + padding;
          left = currentTargetRect.left + currentTargetRect.width / 2 - panelRect.width / 2;
          break;
        case 'left':
        case 'right': {
          // On narrow screens (tablets/small laptops), left/right positions often overlap 
          // adjacent content in grid layouts. Default to center for better visibility.
          if (window.innerWidth < 1200) {
            panel.style.position = 'fixed';
            panel.style.top = '50%';
            panel.style.left = '50%';
            panel.style.bottom = 'auto';
            panel.style.right = 'auto';
            panel.style.transform = 'translate(-50%, -50%)';
            panel.style.margin = '0';
            rafId = requestAnimationFrame(calculatePosition);
            return;
          }

          // For tall targets, align to the top of the target with a small offset
          // This is much more reliable than trying to center on potentially huge sections
          const verticalOffset = Math.min(currentTargetRect.height / 2, 40);
          top = currentTargetRect.top + verticalOffset;
          
          left = step.position === 'left' 
            ? currentTargetRect.left - panelRect.width - padding 
            : currentTargetRect.right + padding;
          break;
        }
        default:
          top = window.innerHeight / 2 - panelRect.height / 2;
          left = window.innerWidth / 2 - panelRect.width / 2;
      }

      // Viewport clamping and flipping logic
      const canFlipTop = currentTargetRect.bottom + panelRect.height + padding < window.innerHeight - screenPadding;
      const canFlipBottom = currentTargetRect.top - panelRect.height - padding > screenPadding;
      const canFlipLeft = currentTargetRect.right + panelRect.width + padding < window.innerWidth - screenPadding;
      const canFlipRight = currentTargetRect.left - panelRect.width - padding > screenPadding;

      // Flip if overflowing on preferred side and there's room on the other side
      if (step.position === 'top' && top < screenPadding && canFlipTop) {
        top = currentTargetRect.bottom + padding;
      } else if (step.position === 'bottom' && top + panelRect.height > window.innerHeight - screenPadding && canFlipBottom) {
        top = currentTargetRect.top - panelRect.height - padding;
      } else if (step.position === 'left' && left < screenPadding && canFlipLeft) {
        left = currentTargetRect.right + padding;
      } else if (step.position === 'right' && left + panelRect.width > window.innerWidth - screenPadding && canFlipRight) {
        left = currentTargetRect.left - panelRect.width - padding;
      }

      // Final clamping to ensure it stays on screen
      left = Math.max(screenPadding, Math.min(left, window.innerWidth - panelRect.width - screenPadding));
      top = Math.max(screenPadding, Math.min(top, window.innerHeight - panelRect.height - screenPadding));

      panel.style.position = 'fixed';
      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
      panel.style.transform = 'none';
      panel.style.margin = '0';
      
      rafId = requestAnimationFrame(calculatePosition);
    };

    rafId = requestAnimationFrame(calculatePosition);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  // Stagger variants for content
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Click-blocking backdrop */}
      <div 
        className="absolute inset-0 bg-transparent pointer-events-auto" 
      />

      {/* Fallback backdrop when no target is highlighted */}
      <AnimatePresence>
        {!hasTarget && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 pointer-events-none z-[9999]"
          />
        )}
      </AnimatePresence>

      {/* Highlight Box with massive shadow as backdrop - Traveling version */}
      <motion.div
        className="pointer-events-none z-[10000]"
        style={{
          position: 'fixed',
          top: highlightTop,
          left: highlightLeft,
          width: highlightWidth,
          height: highlightHeight,
          borderRadius: highlightRadius,
          opacity: highlightOpacity,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.85), 0 0 0 1px var(--system-accent), 0 0 30px var(--system-accent-muted)'
        }}
      >
        {/* Scanning Spotlight Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--system-accent-rgb),0.15)_0%,transparent_70%)]" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-system-accent/40 shadow-[0_0_15px_var(--system-accent-glow)] animate-scan-line" />
        </div>
        
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-system-accent rounded-full animate-ping" />
      </motion.div>

      {/* Content Pop-up */}
      <div className="absolute inset-0 flex items-start justify-center p-4 pt-[25vh] md:pt-[20vh] pointer-events-none z-[10001]">
        <AnimatePresence mode="wait">
          {!isChangingStep && (
            <motion.div
              ref={panelRef}
              key={`content-${currentStep}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={`
                pointer-events-auto
                max-w-sm w-full h-fit bg-system-bg-panel/90 backdrop-blur-[20px] border border-system-accent/40 p-6 rounded-3xl shadow-2xl system-inner-glow
              `}
            >
            <motion.div variants={itemVariants} className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="p-2 bg-system-accent/10 rounded-xl border border-system-accent/20 animate-pulse-glow"
                  style={{ '--glow-color': 'var(--system-accent-muted)' } as any}
                >
                  {step.icon}
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-sm font-orbitron text-system-accent uppercase tracking-widest">{step.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-system-text-muted font-mono uppercase tracking-tighter">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                    <select
                      value={currentStep}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setCurrentStep(val);
                      }}
                      className="bg-system-bg-base/60 text-system-accent border border-system-accent/20 rounded-md px-1.5 py-0.5 text-[9px] font-orbitron uppercase tracking-widest focus:outline-none focus:border-system-accent focus:ring-1 focus:ring-system-accent/30 cursor-pointer max-w-[140px] truncate"
                    >
                      {steps.map((s, i) => (
                        <option key={i} value={i} className="bg-system-bg-panel-solid/95 text-system-text font-orbitron text-[10px]">
                          {String(i + 1).padStart(2, '0')}: {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1 text-system-text-muted hover:text-system-text transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>

            <motion.p variants={itemVariants} className="text-xs text-system-text leading-relaxed mb-6 font-light italic">
              "{step.content}"
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center justify-between mt-2">
              <button 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-1 text-[10px] font-orbitron text-system-text-muted hover:text-system-text transition-colors disabled:opacity-0 py-2"
              >
                <ChevronLeft className="w-4 h-4" /> PREV
              </button>
              
              <div className="hidden md:flex items-center gap-1.5 px-4">
                {steps.length <= 12 && steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-system-accent w-3' : 'bg-system-accent/20'}`} 
                  />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className="flex items-center gap-1 text-[10px] font-orbitron text-system-accent hover:text-system-text transition-colors px-4 py-2 bg-system-accent/5 rounded-xl border border-system-accent/20 whitespace-nowrap"
              >
                {currentStep === steps.length - 1 ? 'FINISH' : 'NEXT'} <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
};

export default Walkthrough;
