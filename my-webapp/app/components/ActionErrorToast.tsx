import { AlertCircle, RotateCcw, X } from 'lucide-react';

interface ActionErrorToastProps {
  title: string;
  description: string;
  onDismiss: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
}

export function ActionErrorToast({
  title,
  description,
  onDismiss,
  onRetry,
  retryLabel = 'Retry',
  retrying = false,
}: ActionErrorToastProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-60 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border-2 border-[#8B3A3A] bg-[#FFF6F4] px-4 py-3 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-[#FFEBEE] p-2 shrink-0">
            <AlertCircle className="w-5 h-5 text-[#8B3A3A]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#6B2020]">{title}</p>
            <p className="mt-1 text-sm text-[#5C4A2F]">{description}</p>

            <div className="mt-3 flex items-center gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  disabled={retrying}
                  className="btn-primary !px-3 !py-1.5 text-sm from-[#8B3A3A] to-[#8B3A3A] hover:from-[#6B2020] hover:to-[#6B2020] border-[#6B2020] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RotateCcw className={'w-4 h-4' + (retrying ? ' animate-spin' : '')} />
                  <span>{retrying ? 'Retrying...' : retryLabel}</span>
                </button>
              )}

              <button
                onClick={onDismiss}
                className="btn-secondary !px-3 !py-1.5 text-sm border-[#D9C7AA] bg-white hover:border-[#8B6F47] hover:bg-[#F5EFE0]"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="btn-ghost rounded-lg !p-1 border-transparent text-[#8B6F47] hover:bg-white hover:text-[#3D1409]"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}