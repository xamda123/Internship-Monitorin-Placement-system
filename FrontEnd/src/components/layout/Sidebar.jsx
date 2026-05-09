import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Layers, 
  Hospital, 
  Calendar, 
  BarChart3, 
  Settings, 
  UserCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUser } from '../../context/UserContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: UserSquare2, label: 'Supervisors', path: '/supervisors' },
  { icon: Layers, label: 'Groups', path: '/groups' },
  { icon: Hospital, label: 'Hospital Assignments', path: '/hospitals' },
  { icon: Calendar, label: 'Internship Scheduling', path: '/scheduling' },
  { icon: BarChart3, label: 'Reports & Analytics', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: UserCircle, label: 'Admin Profile', path: '/profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useUser();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 flex flex-col z-40">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">InternPortal</h1>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} className={cn(
                    "transition-colors",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600"
                  )} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-white/80" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Admin')}&background=2563eb&color=fff`} alt="Admin" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">
                {user ? user.full_name : 'Administrator'}
              </p>
              <p className="text-xs text-gray-500">System Admin</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
