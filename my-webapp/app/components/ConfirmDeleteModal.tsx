import { useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export function ConfirmDeleteModal({ title, message, onConfirm, onCancel, confirmLabel = 'Delete' }: ConfirmDeleteModalProps) {
  const backdropMouseDown = useRef(false);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60"
      onMouseDown={(e) => { backdropMouseDown.current = e.target === e.currentTarget; }}
      onMouseUp={(e) => {
        if (backdropMouseDown.current && e.target === e.currentTarget) onCancel();
        backdropMouseDown.current = false;
      }}
    >
      <div
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B3A3A] rounded-2xl max-w-sm w-full p-6 shadow-2xl"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#FFEBEE] border-2 border-[#8B3A3A]/40 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#8B3A3A]" />
          </div>
          <h3 className="text-lg font-extrabold text-[#3D1409]">{title}</h3>
        </div>

        <p className="text-[#5C4A2F] text-sm mb-6">
          {message || 'Are you sure? This cannot be undone.'}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1 px-4 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary flex-1 px-4 py-2.5 from-[#8B3A3A] to-[#6B2020] hover:from-[#6B2020] hover:to-[#4A1515] border-[#6B2020]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
