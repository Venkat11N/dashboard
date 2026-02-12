import { useSidebar } from '../../context/SidebarContext';
import { LogOut, Menu, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { toggle } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Clear tokens and session data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 2. Clear any other user-specific flags if you have them
    // localStorage.clear(); // Optional: clears everything

    // 3. Redirect to the login page
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
        <h1 className="font-bold text-slate-800 tracking-tight text-lg">Grievance</h1>
      </div>

      <div className='flex items-center gap-4'>
        <button className='p-2 text-slate-400 hover:text-blue-600 relative'>
          <Bell size={20} />
          <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white'></span>
        </button>

        <button
          onClick={handleLogout}
          className='flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all'
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}