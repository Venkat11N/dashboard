import { CheckCircle2, Clock, AlertCircle, User, MessageSquare } from 'lucide-react';

interface TimelineEvent {
  status: string;
  actor: string;
  role: string;
  date: string;
  remarks?: string;
  type: 'SUCCESS' | 'PENDING' | 'QUERY' | 'NEUTRAL';
}

export default function ApplicationTimeline({ events }: { events: TimelineEvent[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'QUERY': return <MessageSquare className="text-amber-500" size={18} />;
      case 'PENDING': return <Clock className="text-blue-500" size={18} />;
      default: return <User className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
        <Clock className="text-slate-400" size={20} />
        Application Lifecycle Traceability
      </h3>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
        {events.map((event, index) => (
          <div key={index} className="relative flex items-start gap-6 group">

            <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm shrink-0 transition-transform group-hover:scale-110 
              ${event.type === 'SUCCESS' ? 'bg-green-50' : event.type === 'QUERY' ? 'bg-amber-50' : 'bg-slate-50'}`}>
              {getIcon(event.type)}
            </div>

            <div className="flex-1 pt-1 pb-4 border-b border-slate-50 last:border-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900 leading-none">{event.status}</h4>
                <time className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                  {event.date}
                </time>
              </div>
              
              <p className="text-xs text-slate-500 font-medium">
                Processed by: <span className="text-slate-700">{event.actor}</span> • <span className="uppercase tracking-widest text-[9px] font-black">{event.role}</span>
              </p>

              {event.remarks && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed italic">
                  "{event.remarks}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}