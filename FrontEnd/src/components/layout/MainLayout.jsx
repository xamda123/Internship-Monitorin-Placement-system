import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 mt-20 p-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        <footer className="py-6 px-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Internship Monitoring System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
