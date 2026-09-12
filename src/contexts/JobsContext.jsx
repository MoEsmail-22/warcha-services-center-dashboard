import { createContext, useContext, useMemo, useState } from 'react';
import { mockJobs } from '@/mocks/JopBoard';
import { MOCK_AVATAR_COLORS } from '@/mocks/constants';
import { useBookings } from './BookingsContext';

const JobsContext = createContext(null);

export const JOB_STAGES = ['new', 'diagnosing', 'in_progress', 'ready'];
const NEXT_STAGE = {
  new: 'diagnosing',
  diagnosing: 'in_progress',
  in_progress: 'ready',
};

const initialsFrom = (name = '') =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

/** Create the quote record that follows a job through diagnosis and billing. */
const quoteFromJob = (job) => ({
  id: `Q-${job.id}`,
  jobId: job.id,
  bookingId: job.bookingId,
  customer: {
    name: job.customer,
    initials: job.initials || initialsFrom(job.customer),
    avatarColor: MOCK_AVATAR_COLORS.customer,
  },
  vehicle: job.vehicle,
  service: job.service,
  amount: 0,
  status: job.quoteStatus ?? 'draft',
  sentAt: job.quoteStatus === 'sent' ? 'Previously sent' : null,
  lineItems: [{ id: `${job.id}-service`, label: job.service, amount: 0 }],
  futureRepairs: [],
});

// Never infer that billing was sent from the job stage. Only explicit mock
// quote data can unlock Ready, matching how the backend will validate it.
const initialWorkflowQuotes = mockJobs.filter((job) => job.quoteStatus).map(quoteFromJob);

export function JobsProvider({ children }) {
  const { updateBookingStatus } = useBookings();
  const [jobs, setJobs] = useState(mockJobs);
  const [workflowQuotes, setWorkflowQuotes] = useState(initialWorkflowQuotes);

  const getQuoteForJob = (jobId) => workflowQuotes.find((quote) => quote.jobId === jobId);

  const createWorkflowQuote = (jobId) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return { created: false, reason: 'jobNotFound' };
    if (job.stage === 'new') return { created: false, reason: 'diagnosisRequired' };
    const existing = getQuoteForJob(jobId);
    if (existing) return { created: false, reason: 'quoteAlreadyExists', quote: existing };

    const quote = quoteFromJob({ ...job, stage: 'diagnosing' });
    setWorkflowQuotes((current) =>
      current.some((item) => item.jobId === job.id) ? current : [quote, ...current]
    );
    updateBookingStatus(job.bookingId, 'quote_pending', { quoteId: quote.id });
    return { created: true, quote };
  };

  const canMoveJob = (jobId, newStage) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return { allowed: false, reason: 'jobNotFound' };
    if (job.stage === newStage) return { allowed: true };

    const currentStageIndex = JOB_STAGES.indexOf(job.stage);
    const newStageIndex = JOB_STAGES.indexOf(newStage);
    const isMovingBackward = newStageIndex < currentStageIndex;

    if (!isMovingBackward && NEXT_STAGE[job.stage] !== newStage) {
      return { allowed: false, reason: 'invalidTransition' };
    }

    const quote = getQuoteForJob(jobId);
    if (newStage === 'ready' && quote?.status !== 'sent') {
      return { allowed: false, reason: 'quoteMustBeSent' };
    }
    return { allowed: true };
  };

  const moveJob = (jobId, newStage) => {
    const result = canMoveJob(jobId, newStage);
    if (!result.allowed) return result;

    const job = jobs.find((item) => item.id === jobId);
    setJobs((current) =>
      current.map((item) => (item.id === jobId ? { ...item, stage: newStage } : item))
    );

    const quote = getQuoteForJob(jobId);
    if (newStage === 'new') {
      updateBookingStatus(job.bookingId, 'pending');
    } else if (['diagnosing', 'in_progress'].includes(newStage)) {
      updateBookingStatus(
        job.bookingId,
        quote?.status === 'sent'
          ? 'billing_in_progress'
          : quote?.status === 'draft'
            ? 'quote_pending'
            : 'in_progress'
      );
    } else if (newStage === 'ready') {
      updateBookingStatus(job.bookingId, 'billing_in_progress');
    }

    return { allowed: true };
  };

  const reorderJobs = (sourceIndex, destIndex, stage) => {
    setJobs((current) => {
      const stageJobs = current.filter((job) => job.stage === stage);
      const otherJobs = current.filter((job) => job.stage !== stage);
      const [moved] = stageJobs.splice(sourceIndex, 1);
      stageJobs.splice(destIndex, 0, moved);
      return [...otherJobs, ...stageJobs];
    });
  };

  const sendWorkflowQuote = (quoteId, lineItems, futureRepairs = []) => {
    const total = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const quote = workflowQuotes.find((item) => item.id === quoteId);
    if (!quote || total <= 0) return null;

    const sentAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    setWorkflowQuotes((current) =>
      current.map((item) =>
        item.id === quoteId
          ? { ...item, lineItems, futureRepairs, amount: total, status: 'sent', sentAt }
          : item
      )
    );
    // A successfully sent billing quote unlocks and advances the linked job
    // to Ready. The booking remains Billing in progress until admin approval.
    setJobs((current) =>
      current.map((job) => (job.id === quote.jobId ? { ...job, stage: 'ready' } : job))
    );
    updateBookingStatus(quote.bookingId, 'billing_in_progress', {
      quoteId,
      quoteSentAt: new Date().toISOString(),
    });
    return { ...quote, lineItems, futureRepairs, amount: total, status: 'sent', sentAt };
  };

  /**
   * Reserved for the future admin/backend acceptance event.
   * This action is intentionally not exposed by the workshop Quotes UI.
   */
  const acceptWorkflowQuote = (quoteId) => {
    const quote = workflowQuotes.find((item) => item.id === quoteId);
    const job = jobs.find((item) => item.id === quote?.jobId);
    if (!quote || quote.status !== 'sent') {
      return { accepted: false, reason: 'quoteMustBeSent' };
    }
    if (!job || job.stage !== 'ready') {
      return { accepted: false, reason: 'jobMustBeReady' };
    }

    setWorkflowQuotes((current) =>
      current.map((item) => (item.id === quoteId ? { ...item, status: 'accepted' } : item))
    );
    setJobs((current) => current.filter((item) => item.id !== job.id));
    updateBookingStatus(job.bookingId, 'completed', {
      quoteId: quote.id,
      completedAt: new Date().toISOString(),
    });
    return { accepted: true };
  };

  const cancelJob = (jobId) => {
    const job = jobs.find((item) => item.id === jobId);
    setJobs((current) => current.filter((item) => !(item.id === jobId && item.stage === 'new')));
    if (job?.stage === 'new')
      updateBookingStatus(job.bookingId, 'cancelled', { cancellationFee: 50 });
  };

  const value = useMemo(
    () => ({
      jobs,
      workflowQuotes,
      moveJob,
      reorderJobs,
      canMoveJob,
      createWorkflowQuote,
      sendWorkflowQuote,
      acceptWorkflowQuote,
      cancelJob,
    }),
    [jobs, workflowQuotes]
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) throw new Error('useJobs must be used inside a <JobsProvider>');
  return context;
}
