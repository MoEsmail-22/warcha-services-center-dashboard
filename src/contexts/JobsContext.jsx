import { createContext, useContext, useState } from 'react';
import { mockJobs } from '@/mocks/JopBoard';

const JobsContext = createContext(null);

// 4 stages matching the mockup
export const JOB_STAGES = ['new', 'diagnosing', 'in_progress', 'ready'];

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState(mockJobs);

  // Move a job to a different stage (called after drag)
  const moveJob = (jobId, newStage) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, stage: newStage } : j)));
  };

  // Reorder within a stage
  const reorderJobs = (sourceIndex, destIndex, stage) => {
    setJobs((prev) => {
      const stageJobs = prev.filter((j) => j.stage === stage);
      const otherJobs = prev.filter((j) => j.stage !== stage);
      const [moved] = stageJobs.splice(sourceIndex, 1);
      stageJobs.splice(destIndex, 0, moved);
      return [...otherJobs, ...stageJobs];
    });
  };

  const value = { jobs, moveJob, reorderJobs };
  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used inside a <JobsProvider>');
  return ctx;
}
