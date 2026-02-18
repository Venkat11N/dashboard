import { useSidebar } from '../../context/SidebarContext';
import { LogOut, Menu, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGovernance } from '../../core/GovernanceContext';

export default function Navbar() {
  const { toggle } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useGovernance(); // Assuming you have logout in context

  const handleLogout = () => {
    // Call context logout if available
    if (logout) logout();
    
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    navigate('/login');
  };

  // Get page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.includes('/grievances')) return 'Grievance Portal';
    if (path.includes('/track')) return 'Track Status';
    if (path.includes('/documents')) return 'Documents';
    if (path.includes('/profile')) return 'My Profile';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between sticky top-0 z-20 shadow-sm">
      <div className='flex items-center gap-4'>
        <button
          onClick={toggle}
          className='p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors md:hidden'
        >
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-slate-800 text-lg">
          {getPageTitle()}
        </h1>
      </div>

      <div className='flex items-center gap-2'>
        <button className='p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 relative transition-colors'>
          <Bell size={20} />
          <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white'></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-2"></div>

        <button
          onClick={() => navigate('/dashboard/profile')}
          className='p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors'
          title="Profile"
        >
          <User size={20} />
        </button>

        <button
          onClick={handleLogout}
          className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1'
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}