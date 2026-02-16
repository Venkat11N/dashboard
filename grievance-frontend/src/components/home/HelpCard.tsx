import { ChevronRight } from "lucide-react";

export default function HelpCard() {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <h4 className="font-semibold text-slate-900 mb-2">need Help?</h4>
      <p className="text-sm text-slate-600 mb-4">
        Our support team repsonds within 24 hours on working days.
      </p>
      <button className="text-sm font-semibold text-indigo-600 hover:text-indugo-700 inline-flex items-center gap-1">
        Contact Support
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}