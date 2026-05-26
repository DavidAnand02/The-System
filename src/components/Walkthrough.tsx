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
  Settings,
  Folder
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
      content: "Welcome, Player. This setup guide outlines the key features of your tracking interface. Let's walk through the main tabs and views.",
      targetId: "dashboard-header",
      position: 'bottom',
      page: 'landing',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    // DASHBOARD
    {
      title: "The Dashboard",
      content: "Your main landing panel. Use the navigation buttons to toggle views: Status, Skills, Quests, Jobs, and the Timelog.",
      targetId: "dashboard-nav",
      position: 'bottom',
      page: 'landing',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Ability Scores",
      content: "Tracks your primary attributes. These indicators represent physical and mental stats, earned by logging skill hours and completing daily quests.",
      targetId: "dashboard-stats",
      position: 'bottom',
      page: 'landing',
      icon: <Star className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Top Skills",
      content: "Displays your highest-level skills. Logging hours here is the fastest way to increase your core attributes.",
      targetId: "dashboard-skills",
      position: 'bottom',
      page: 'landing',
      icon: <Brain className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Active Classes",
      content: "Displays your equipped jobs and life roles. Practice hours count toward job levels, which grant permanent stat points.",
      targetId: "dashboard-jobs",
      position: 'bottom',
      page: 'landing',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Active Directives",
      content: "Prioritized list of your current quests. Complete them regularly to build stats and maintain your daily streak.",
      targetId: "dashboard-quests",
      position: 'bottom',
      page: 'landing',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "System Advice",
      content: "Live suggestions and status tips. Check this panel to optimize your current habits and leveling plan.",
      targetId: "dashboard-advice",
      position: 'bottom',
      page: 'landing',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Status Protocol",
      content: "Your profile center. Switch tabs here to audit your general rank, active level, and global milestones.",
      targetId: "nav-status",
      position: 'top',
      page: 'landing',
      icon: <Shield className="w-6 h-6 text-system-accent" />
    },
    // STATUS PAGE
    {
      title: "System Rank",
      content: "Your Rank shows your absolute milestone level. Higher ranks are unlocked as you increase your overall stats.",
      targetId: "status-rank-card",
      position: 'right',
      page: 'status',
      icon: <Star className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Level Projection",
      content: "Monitor your current level and experience bar. Drag the simulation slider to calculate potential level increases.",
      targetId: "status-level-panel",
      position: 'left',
      page: 'status',
      icon: <Activity className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Equipped Matrix",
      content: "Assign your active classes, titles, and beliefs. These parameters modify your passive stat gains.",
      targetId: "status-equipped",
      position: 'right',
      page: 'status',
      icon: <Brain className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Attribute Balance",
      content: "A radar chart showing your attribute layout. Use it to scan for weak spots in your routine.",
      targetId: "status-radar",
      position: 'left',
      page: 'status',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "System Identity",
      content: "Rename your profile and select an active Title. Equipped Titles provide target stat bonuses.",
      targetId: "status-username-input",
      position: 'bottom',
      page: 'status',
      icon: <Shield className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Archive System",
      content: "Your library of unlocked Achievements. Browse and swap in your unlocked Titles or Mindset presets.",
      targetId: "status-archive-system",
      position: 'bottom',
      page: 'status',
      icon: <Shield className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Active Passives",
      content: "Audit all permanent traits currently applied to your player file. Passive traits represent long-term habits.",
      targetId: "status-synergy-storage",
      position: 'bottom',
      page: 'status',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    // SKILLS PAGE
    {
      title: "Skill Repository",
      content: "Skills are your focused sub-disciplines. Logging practice hours triggers level-ups and yields stat points.",
      targetId: "nav-skills",
      position: 'top',
      page: 'landing',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Skill List",
      content: "Shows all active skills. Click any skill to configure details, add logs, or change its attribute rewards.",
      targetId: "skills-list",
      position: 'right',
      page: 'skills',
      icon: <Activity className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Add New Skill",
      content: "Press '+' to register a new skill. Define its category and select which stat gains points when the skill levels up.",
      targetId: "skills-add-btn",
      position: 'left',
      page: 'skills',
      icon: <Plus className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Folders & Filters",
      content: "Organize skills using folders. Toggle between folder group view and flat list view to tidy up.",
      targetId: "skills-folder-btn",
      position: 'bottom',
      page: 'skills',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Create Folders / Clusters",
      content: "In Folder View, you can click 'Create Cluster Directory' to build a specialized storage segment for your custom skills.",
      targetId: "skills-add-folder-btn",
      position: 'bottom',
      page: 'skills',
      icon: <Folder className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Database Search",
      content: "Quickly filter skills by keying in names or tags using the search input.",
      targetId: "skills-search",
      position: 'bottom',
      page: 'skills',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Skill Analytics",
      content: "Displays your training hours over time so you can inspect your consistency.",
      targetId: "skills-analytics-toggle",
      position: 'top',
      page: 'skills',
      icon: <BarChart3 className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Detailed Progress Metrics",
      content: "Opening up a skill displays exact level milestones, total mastery hours, and daily habit metrics to analyze training patterns.",
      targetId: "skills-detail-metrics",
      position: 'right',
      page: 'skills',
      icon: <Activity className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Directory Assignment",
      content: "Organize your skills inside functional directories. Click the directory assignment dropdown to assign this skill to a custom folder.",
      targetId: "skills-detail-directory-select",
      position: 'right',
      page: 'skills',
      icon: <Folder className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Skill Evolution Rewards",
      content: "Neural Rewards automatically issue points to your ability score stats every time this skill levels up.",
      targetId: "skills-detail-neural-rewards",
      position: 'left',
      page: 'skills',
      icon: <Trophy className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Add Level-Up Rewards",
      content: "Amplify your growth! Expand which attributes are automatically rewarded by choosing stats from this selector.",
      targetId: "skills-detail-add-reward-select",
      position: 'left',
      page: 'skills',
      icon: <Plus className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Embedded Synergies",
      content: "Add custom effects, requirements, and background parameters to this skill. Click the '+' icon to register new synergies.",
      targetId: "skills-detail-add-synergy-btn",
      position: 'left',
      page: 'skills',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Erase Progress",
      content: "If you need to wipe training milestones, click the Purge button inside skill details. Note: Deleted data is lost forever.",
      targetId: "skills-purge-btn",
      position: 'top',
      page: 'skills',
      icon: <X className="w-6 h-6 text-red-400" />
    },
    // JOBS PAGE
    {
      title: "Job Classes",
      content: "Jobs map to your professional career tracks. Levels here grant stat boosts and passive loop adjustments.",
      targetId: "nav-jobs",
      position: 'top',
      page: 'landing',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Job Selection",
      content: "Equip a primary career track to direct your main focus. Leveling requires training hours in corresponding skills.",
      targetId: "jobs-list",
      position: 'right',
      page: 'jobs',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Add New Job",
      content: "Press here to initialize a new job class. Match it to a discipline to begin tracking hours.",
      targetId: "jobs-add-btn",
      position: 'left',
      page: 'jobs',
      icon: <Plus className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Filter Careers",
      content: "Search active and archived jobs by name to quickly check current level paths.",
      targetId: "jobs-search",
      position: 'bottom',
      page: 'jobs',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Class Distribution",
      content: "Check this panel to see how your career time and class milestones are balanced.",
      targetId: "jobs-analytics",
      position: 'bottom',
      page: 'jobs',
      icon: <BarChart3 className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Quick Log Hours",
      content: "Add or subtract career hours directly (+1H, +5H) from the class dashboard to easily record updates.",
      targetId: "jobs-detail-hours-panel",
      position: 'right',
      page: 'jobs',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Class Level Rewards",
      content: "Earning professional level milestones awards point multipliers and passive career benefits.",
      targetId: "jobs-detail-level-rewards",
      position: 'left',
      page: 'jobs',
      icon: <Trophy className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Manage Level-Up Rewards",
      content: "Click the Settings/Cog icon to activate editing mode for class level rewards. This lets you modify assigned stat point yields.",
      targetId: "jobs-detail-reward-config-toggle-btn",
      position: 'top',
      page: 'jobs',
      icon: <Settings className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Add Reward Parameter",
      content: "Add a new ability score parameter to your rewards config. Tweak stat point values rewarded on leveling up.",
      targetId: "jobs-detail-add-reward-btn",
      position: 'top',
      page: 'jobs',
      icon: <Plus className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Class Synergies",
      content: "Embed dynamic neural multipliers, custom multipliers, or background effects. Press '+' to register passive benefits.",
      targetId: "jobs-detail-add-synergy-btn",
      position: 'left',
      page: 'jobs',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Erase Class progress",
      content: "Use the Purge Class utility to wipe career logs if necessary. Exercise caution, as erased data is irrecoverable.",
      targetId: "jobs-purge-btn",
      position: 'top',
      page: 'jobs',
      icon: <X className="w-6 h-6 text-red-400" />
    },
    // QUESTS PAGE
    {
      title: "Quest Board",
      content: "Quests represent your daily objectives. Finish tasks to earn stat upgrades and avoid fail penalties.",
      targetId: "nav-quests",
      position: 'top',
      page: 'landing',
      icon: <Zap className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Active Tasks",
      content: "Your active objectives are listed here. Tick off sub-quests to progress the main bar.",
      targetId: "quests-list",
      position: 'right',
      page: 'quests',
      tab: 'recurring',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Daily vs. Direct",
      content: "Recurring quests help build routine habits with streak counters. One-Off quests track single goals.",
      targetId: "quests-tabs",
      position: 'bottom',
      page: 'quests',
      icon: <Activity className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Create Quest",
      content: "Initialize target quests here. Configure difficulty weights, target stats, and penalties for failing.",
      targetId: "quests-add-btn",
      position: 'left',
      page: 'quests',
      tab: 'recurring',
      icon: <Plus className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Filter Objectives",
      content: "Instantly search through quests by entering keywords from the title.",
      targetId: "quests-search",
      position: 'bottom',
      page: 'quests',
      icon: <Target className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Quest Log",
      content: "Switch to this tab to audit previous results, checking both completed goals and failed attempts.",
      targetId: "quests-log-tab",
      position: 'bottom',
      page: 'quests',
      tab: 'log',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "History Feed",
      content: "A detailed registry of quest outcomes. Each block indicates a finished or expired directive.",
      targetId: "quests-log-container",
      position: 'top',
      page: 'quests',
      tab: 'log',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Edit Entry",
      content: "Adjust details on recent logs or fix text labels directly inside the history items.",
      targetId: "quests-log-entry",
      position: 'bottom',
      page: 'quests',
      tab: 'log',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    // TIMELOG PAGE
    {
      title: "The Timelog",
      content: "Tracks exactly how your hours are distributed across various routine tasks.",
      targetId: "nav-timelog",
      position: 'top',
      page: 'landing',
      icon: <Clock className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Calendar Ledger",
      content: "Select specific days to view detailed hour slots. Highlighted blocks show days with recorded practice.",
      targetId: "timelog-calendar",
      position: 'right',
      page: 'timelog',
      icon: <Clock className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Grid Layout",
      content: "Review a static structural view of your hourly timeline blocks logged throughout the day.",
      targetId: "timelog-view-toggle",
      position: 'bottom',
      page: 'timelog',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Flow Layout",
      content: "Review a visual summary of your daily active periods, detailing when you are most productive.",
      targetId: "timelog-view-toggle",
      position: 'bottom',
      page: 'timelog',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Category Tags",
      content: "Group related logs with colored tags to keep your hour distribution cleanly organized.",
      targetId: "timelog-contexts",
      position: 'left',
      page: 'timelog',
      icon: <Brain className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Productivity Heatmap",
      content: "Charts plotting your log frequency. High spikes highlight your peak daily habits.",
      targetId: "timelog-pulse",
      position: 'bottom',
      page: 'timelog',
      viewMode: 'flow',
      icon: <BarChart3 className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Time Shares",
      content: "D3 heatmap displays the total minutes assigned per category tag to audit daily progress.",
      targetId: "timelog-analytics",
      position: 'bottom',
      page: 'timelog',
      viewMode: 'flow',
      icon: <Clock className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Consistency Plots",
      content: "Trend lines showing your practice routine stability over monthly cycles.",
      targetId: "timelog-trend",
      position: 'bottom',
      page: 'timelog',
      viewMode: 'flow',
      icon: <Activity className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Clear Logs",
      content: "Reset log data for the active date if you need a fresh start. Proceed with caution.",
      targetId: "timelog-purge-btn",
      position: 'bottom',
      page: 'timelog',
      icon: <X className="w-6 h-6 text-red-400" />
    },
    // SYSTEM MENU
    {
      title: "System Menu",
      content: "Central hub for configuration. Tap here to open the Manual, replay this Guide, or export backups.",
      targetId: "nav-settings",
      position: 'top',
      page: 'landing',
      icon: <Settings className="w-6 h-6 text-system-accent" />
    },
    {
      title: "Guide Mode",
      content: "Restart this interactive tutorial anytime to review basic menu layouts.",
      targetId: "system-menu-guide-btn",
      position: 'top',
      page: 'landing',
      icon: <Play className="w-6 h-6 text-system-accent" />
    },
    {
      title: "System Manual",
      content: "The master guide detailing stat calculations, leveling thresholds, backup steps, and offline sync parameters.",
      targetId: "system-menu-manual-btn",
      position: 'top',
      page: 'landing',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    // INSTRUCTIONS PAGE
    {
      title: "System Reference",
      content: "Browse the absolute leveling rules and tracking math. A complete index of how points are distributed.",
      targetId: "instructions-content",
      position: 'bottom',
      page: 'instructions',
      icon: <Info className="w-6 h-6 text-system-accent" />
    },
    // CONCLUSION
    {
      title: "System Ready",
      content: "The tour is complete. Create your first Skill and Job class, then configure daily goals on the Quest Board.",
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
    if (!isChangingStep) {
      const step = steps[currentStep];
      if (!step) return;

      const skillDetailIds = [
        'skills-detail-metrics',
        'skills-detail-neural-rewards',
        'skills-purge-btn',
        'skills-detail-directory-select',
        'skills-detail-add-reward-select',
        'skills-detail-add-synergy-btn'
      ];
      if (step.targetId && skillDetailIds.includes(step.targetId)) {
        window.dispatchEvent(new CustomEvent('open-skill-detail'));
      }

      if (step.targetId === 'skills-folder-btn' || step.targetId === 'skills-add-folder-btn') {
        window.dispatchEvent(new CustomEvent('set-skills-folder-view'));
      }

      const jobDetailIds = [
        'jobs-detail-hours-panel',
        'jobs-detail-level-rewards',
        'jobs-purge-btn',
        'jobs-detail-add-synergy-btn'
      ];
      const jobRewardConfigIds = [
        'jobs-detail-reward-config-toggle-btn',
        'jobs-detail-add-reward-btn'
      ];

      if (step.targetId && jobDetailIds.includes(step.targetId)) {
        window.dispatchEvent(new CustomEvent('open-job-detail'));
      } else if (step.targetId && jobRewardConfigIds.includes(step.targetId)) {
        window.dispatchEvent(new CustomEvent('open-job-reward-config'));
      }
    }
  }, [isChangingStep, currentStep, steps]);

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

    // Dynamic walkthrough detail modal triggers
    const skillDetailIds = [
      'skills-detail-metrics',
      'skills-detail-neural-rewards',
      'skills-purge-btn',
      'skills-detail-directory-select',
      'skills-detail-add-reward-select',
      'skills-detail-add-synergy-btn'
    ];
    if (step.targetId && skillDetailIds.includes(step.targetId)) {
      window.dispatchEvent(new CustomEvent('open-skill-detail'));
    } else {
      window.dispatchEvent(new CustomEvent('close-skill-detail'));
    }

    // Skills Folder/List view toggles
    if (step.targetId === 'skills-folder-btn' || step.targetId === 'skills-add-folder-btn') {
      window.dispatchEvent(new CustomEvent('set-skills-folder-view'));
    } else if (step.page === 'skills') {
      window.dispatchEvent(new CustomEvent('set-skills-list-view'));
    }

    const jobDetailIds = [
      'jobs-detail-hours-panel',
      'jobs-detail-level-rewards',
      'jobs-purge-btn',
      'jobs-detail-add-synergy-btn'
    ];
    const jobRewardConfigIds = [
      'jobs-detail-reward-config-toggle-btn',
      'jobs-detail-add-reward-btn'
    ];

    if (step.targetId && jobDetailIds.includes(step.targetId)) {
      window.dispatchEvent(new CustomEvent('open-job-detail'));
      window.dispatchEvent(new CustomEvent('close-job-reward-config'));
    } else if (step.targetId && jobRewardConfigIds.includes(step.targetId)) {
      window.dispatchEvent(new CustomEvent('open-job-reward-config'));
    } else {
      window.dispatchEvent(new CustomEvent('close-job-detail'));
      window.dispatchEvent(new CustomEvent('close-job-reward-config'));
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
            if (step.targetId === 'skills-purge-btn' || step.targetId === 'jobs-purge-btn') {
              scrollBlock = 'center';
            } else if (step.position === 'top') {
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
