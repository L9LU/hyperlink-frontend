// src/components/ConsentModal.jsx
// Read-only pop-up for the "Privacy and consent" link. Anyone can open it any time.
import { X } from 'lucide-react';
import ConsentText from './ConsentText.jsx';

const ConsentModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-label="Privacy and consent"
    onClick={onClose}
  >
    <div
      className="bg-white w-full sm:max-w-xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#0B1739]">Privacy and consent</h2>
        <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-6 py-4 overflow-y-auto">
        <ConsentText />
      </div>
    </div>
  </div>
);

export default ConsentModal;
