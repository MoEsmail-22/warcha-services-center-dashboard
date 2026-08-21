import { Draggable } from '@hello-pangea/dnd';
import { Clock, Check, FilePlus2, XCircle } from 'lucide-react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import StatusBadge from '../widgets/StatusBadge';

export default function KanbanCard({ job, index, onCancel, onCreateQuote }) {
  const { t } = useAppTranslation('bookings');

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="group cursor-grab rounded-xl border border-gray-200 p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing"
          style={{
            ...provided.draggableProps.style,
            // Card background: #F1F6F5 (light teal tint)
            // When dragging, keep it slightly elevated with the same tint
            backgroundColor: snapshot.isDragging ? '#E8F2F0' : '#F1F6F5',
            boxShadow: snapshot.isDragging
              ? '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.08)'
              : undefined,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-sm font-bold text-gray-900">{job.vehicle}</p>

            {job.stage === 'new' && (
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onCancel(job);
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                {t('cancellation.button')}
              </button>
            )}

          </div>

          {/* ---- Service (gray, below vehicle) ---- */}
          <p className="mt-0.5 text-xs text-gray-500">{job.service}</p>

          {job.stage !== 'new' && !job.quoteStatus && (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onCreateQuote(job);
              }}
              className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              {t('workflow.createQuote')}
            </button>
          )}

          {job.quoteStatus && (
            <div className="mt-2">
              <StatusBadge status={job.quoteStatus} />
            </div>
          )}

          {/* ---- Customer + time (bottom row) ---- */}
          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-[10px] font-bold text-[#0E5C5B]">
                {job.initials}
              </span>
              <span className="text-xs font-medium text-[#0E5C5B]">{job.customer}</span>
            </div>

            {job.done ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                <Check className="h-3 w-3" />
                Done
              </span>
            ) : (
              job.time && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {job.time}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
