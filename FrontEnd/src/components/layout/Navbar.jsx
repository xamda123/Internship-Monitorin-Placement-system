import { Search, Bell, Menu } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUser } from '../../context/UserContext';

const Navbar = () => {
  const { user } = useUser();
  
  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="fixed top-0 right-0 left-72 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-30">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search students, supervisors, assignments..." 
            className="w-full bg-gray-50/50 border border-transparent rounded-xl pl-12 pr-4 py-2.5 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-500 transition-all relative group">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-premium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-4 z-50">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Notifications</h4>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Bell size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">New internship request</p>
                    <p className="text-[10px] text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </button>

        <div className="h-8 w-px bg-gray-100 mx-2"></div>

        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {user ? user.full_name : 'Administrator'}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-200">
            {getInitials(user?.full_name)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
