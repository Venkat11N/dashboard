// src/components/home/modals/TrackStatusModal.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, AlertCircle } from "lucide-react";
import { trackGrievance, getStatusColor } from "../../../utils/grievanceHelpers";

interface TrackStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackStatusModal({ isOpen, onClose }: TrackStatusModalProps) {
  const navigate = useNavigate();
  
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!reference.trim()) {
      setError('Please enter a reference number');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await trackGrievance(reference);
      
      if (response.status === 'ok') {
        setResult(response.data);
      } else {
        setError('Grievance not found');
      }
    } catch (err: any) {
      console.error('Track error:', err);
      setError(err.response?.data?.message || 'Grievance not found');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    onClose();
    navigate(`/dashboard/grievances/${result.grievance_id || result.id}`);
  };

  const handleClose = () => {
    setReference('');
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="text-white" size={20} />
            <h3 className="text-lg font-bold text-white">Track Grievance Status</h3>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>
        

        <div className="p-6">
          {/* Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="e.g., GRV-2026-XXXXXXX"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
          </div>


          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}


          {result && (
            <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Reference</span>
                <span className="font-mono font-semibold">{result.reference_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Subject</span>
                <span className="font-semibold text-slate-800">{result.subject}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(result.status)}`}>
                  {result.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Submitted</span>
                <span className="text-sm text-slate-700">
                  {new Date(result.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <button
                  onClick={handleViewDetails}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
                >
                  View Full Details
                </button>
              </div>
            </div>
          )}


          <button
            onClick={handleTrack}
            disabled={loading}
            className="w-full py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Track Status
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}