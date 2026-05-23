import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PlayerStatus from './PlayerStatus';
import SkillsPage from './SkillsPage';
import QuestsPage from './QuestsPage';
import JobsPage from './JobsPage';
import TimelogPage from './TimelogPage';
import Instructions from './Instructions';
import Dashboard from './Dashboard';

export type Page = 'landing' | 'dashboard' | 'status' | 'skills' | 'quests' | 'jobs' | 'timelog' | 'instructions';

interface PageRouterProps {
  currentPage: Page;
  goBack: () => void;
  handleQuestOutcome: (outcome: 'success' | 'failure', questId?: string) => void;
  onSupport: () => void;
  navigateTo: (page: Page) => void;
  handleRestartWalkthrough: () => void;
}

export const PageRouter: React.FC<PageRouterProps> = ({
  currentPage,
  goBack,
  handleQuestOutcome,
  onSupport,
  navigateTo,
  handleRestartWalkthrough
}) => {
  const renderPage = () => {
    switch (currentPage) {
      case 'status': return <PlayerStatus onBack={goBack} />;
      case 'skills': return <SkillsPage onBack={goBack} />;
      case 'quests': return <QuestsPage onBack={goBack} onQuestOutcome={handleQuestOutcome} />;
      case 'jobs': return <JobsPage onBack={goBack} />;
      case 'timelog': return <TimelogPage onBack={goBack} />;
      case 'instructions': return <Instructions onBack={goBack} onSupport={onSupport} />;
      case 'dashboard':
      case 'landing':
      default: return (
        <Dashboard 
          navigateTo={navigateTo} 
          onStartWalkthrough={handleRestartWalkthrough}
        />
      );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ 
          opacity: 0, 
          scale: 1.1, 
          y: -20,
          filter: 'blur(10px)' 
        }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          filter: 'blur(0px)' 
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.95, 
          x: 20,
          filter: 'blur(5px)' 
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.23, 1, 0.32, 1] // Custom cubic-bezier for "Slam" feel
        }}
        className="w-full h-full"
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
};
