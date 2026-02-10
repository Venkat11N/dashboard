import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function SubmissionSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refNumber, categoryName } = location.state || { 
    refNumber: "GRV-TEMP-000", 
    categoryName: "General" 
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-12 animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
          

          <div className="bg-blue-600 p-12 text-center text-white relative">
            <div className="absolute top-6 right-8 opacity-10">
              <ShieldCheck size={120} />
            </div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Submission Successful</h1>
            <p className="text-blue-100 font-medium">Your grievance has been logged in the E-Gov system.</p>
          </div>

          <div className="p-10 space-y-8">
            {/* Reference Details */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Tracking Reference Number</span>
              <span className="text-4xl font-mono font-black text-blue-600 tracking-tighter">{refNumber}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium">Category</span>
                <span className="text-sm font-bold text-slate-800">{categoryName}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium">Estimated Resolution</span>
                <span className="text-sm font-bold text-green-600">3 Working Days</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-slate-500 font-medium">Next Step</span>
                <span className="text-sm font-bold text-slate-800">Nodal Officer Review</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all"
              >
                <Download size={18} /> Download Receipt
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 transition-all"
              >
                <Home size={18} /> Back to Dashboard
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-xs font-medium">
          A confirmation email has been sent to your registered address.
        </p>
      </div>
    </DashboardLayout>
  );
}

