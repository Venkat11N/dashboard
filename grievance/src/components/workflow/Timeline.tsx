
export const Timeline = ({ events }: { events: any[] }) => {
  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      {events.map((event, index) => (
        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">

          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white">
            <div className="flex items-center justify-between space-x-2 mb-1">
              <div className="font-bold text-slate-900">{event.status}</div>
              <time className="font-mono text-xs text-blue-600">{event.date}</time>
            </div>
            <div className="text-slate-500 text-xs">By: {event.actor}</div>
          </div>
        </div>
      ))}
    </div>
  );
};