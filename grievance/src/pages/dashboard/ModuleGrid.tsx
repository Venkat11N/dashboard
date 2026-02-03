import { useGovernance } from '../../core/GovernanceContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Anchor, ShieldAlert, FileCheck, ArrowRight } from 'lucide-react';


export default function ModuleGrid() {
  const {hasModuleAccess} = useGovernance();
  const navigate = useNavigate();

  const modules = [
    { id: 'GRIEVANCE', 
      label: 'Grievance Management',
      path: '/dashbaord/grievacne', 
      icon: <MessageSquare size={24} />,
      description: 'Digitize application-based workflows for seafarer concerns.' 
    },

    { 
      id: 'CRISIS', 
      label: 'Crisis Management', 
      path: '/dashbaord/compliance', 
      icon: <ShieldAlert size={24} />,
      description: 'Urgent case handling for sensitive maritine events.'
    },

    { 
      id: 'MTI_COMPLIANCE', 
      label: 'MTI Compliance', 
      path: '/dashboard/compliance', 
      icon: <FileCheck size={24} />,
      description: 'Urgent case handling for sensitive maritine events.'
    },

    { 
      id: 'RPSL', 
      label: 'RPSL', 
      path: '/dashboard/compliance', 
      icon: <FileCheck size={24} />,
      description: 'Urgent case handling for sensitive maritine events.'
    },
  ];

  return (
    <div className='grid grid-col-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {modules.map((mod) => (
        hasModuleAccess(mod.id) && (
          <button
            key={mod.id}
            onClick={() => navigate(mod.path)}
            className='p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all text-left group'
          >
            <div className='w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center md-6 translation '>
              {mod.icon}
            </div>
            <h3 className='font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-700 transition-colors'>
              {mod.label}
            </h3>

            <p className='text-xs text-slate-500 mt-3 leading-relaxed'>
              {mod.description}
            </p>

            <div className='mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-all transalte-y-2 group-hover:translate-y-0'>
              Enter Module
            </div>
          </button>
        )
      ))}

    </div>
  )
}