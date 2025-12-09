import React, { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, BarChart2, Users, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title,
  showSidebar = true
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { name: 'Analytics', icon: <BarChart2 className="w-5 h-5" />, path: '/analytics' },
    { name: 'Team', icon: <Users className="w-5 h-5" />, path: '/team' },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Mobile Sidebar */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu}>
          <div
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
            </div>
            <nav className="p-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    toggleMobileMenu();
                  }}
                  className="flex items-center w-full p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  logout();
                  toggleMobileMenu();
                }}
                className="flex items-center w-full p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && showSidebar && (
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
          </div>
          <nav className="p-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="flex items-center w-full p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </button>
            ))}
            <button
              onClick={logout}
              className="flex items-center w-full p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 overflow-auto ${isMobile && isMobileMenuOpen ? 'hidden' : ''}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title || 'TaskFlow'}</h1>
            {user && (
              <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Add mobile-specific controls here */}
            {!isMobile && (
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};