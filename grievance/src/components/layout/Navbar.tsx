import { useSidebar } from '../../context/SidebarContext';
import { LogOut, Menu } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { toggle } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear(); // Clear your OTP guard
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b flex items-center px-6 justify-between sticky top-0 z-10">
      <div className='flex items-center gap-4'>
        <button
          onClick={toggle}
          className='p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors'
        >
          <Menu size={20} />
        </button>
        <h1 className="font-bold text-gray-800 tracking-tight text-lg">Grievance Portal</h1>
      </div>

      <button 
        onClick={handleLogout}
        className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all'
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </header>
  );
}