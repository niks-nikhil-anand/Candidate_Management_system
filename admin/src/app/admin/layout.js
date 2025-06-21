import '@/app/globals.css';
import SidebarAdmin from '@/components/admin/SidebarAdmin';
import NavbarAdmin from '@/components/admin/NavbarAdmin';

const Layout = ({ children }) => {
  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-gray-800">
        <SidebarAdmin />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <NavbarAdmin />
        <main className="flex-1  overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
