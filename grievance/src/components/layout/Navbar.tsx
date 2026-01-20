import { useSidebar } from '../../context/SidebarContext';



export default function Navbar() {
  const { toggle } = useSidebar();

  return (
    <header className="h-14 bg-white border-b flex items-center px-6 justify-between">
      <div className='flex items-center gap-3'>
        <button
          onClick={toggle}
          className='p-2 rounded hover:bg-gray-100'
        >
          ☰
        </button>
        <h1 className="font-semibold">Grievance Dashboard</h1>
      </div>
      <button className='text-sm text-red-600'>Logout</button>
    </header>
  )
}