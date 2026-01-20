import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  Building2, 
  MapPin, 
  UserCircle, 
  Shield, 
  ClipboardList,
  Menu,
  ChevronLeft,
  Moon,
  Sun
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: string;
}

export function Sidebar({ currentView, onNavigate, userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDarkTheme = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setDarkTheme(shouldUseDarkTheme);
    if (shouldUseDarkTheme) {
      document.body.classList.add('dark-theme');
    }
  }, []);

  // Expand sidebar by default on large screens
  useEffect(() => {
    if (window.innerWidth > 768) {
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkTheme;
    setDarkTheme(newTheme);
    document.body.classList.toggle('dark-theme', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const adminMenuItems = [
    { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workLogs', label: 'Work Logs', icon: ClipboardList },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'devices', label: 'Devices', icon: Monitor },
    { id: 'deviceTypes', label: 'Device Types', icon: Monitor },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'areas', label: 'Areas', icon: MapPin },
    { id: 'accounts', label: 'Accounts', icon: UserCircle },
    { id: 'roles', label: 'Roles', icon: Shield },
  ];

  const employeeMenuItems = [
    { id: 'employee', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workLogs', label: 'Work Logs', icon: ClipboardList },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile navbar */}
      <nav className="site-nav">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Backdrop for mobile */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/60 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Sidebar header */}
        <div className="sidebar-header">
          <div className="flex items-center gap-3">
            <div className={`header-logo transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <span className={`font-semibold text-lg transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              IT Support
            </span>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="sidebar-content">
          {/* Sidebar Menu */}
          <ul className="menu-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id} className="menu-item">
                  <a
                    href="#"
                    className={`menu-link ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.id);
                      if (window.innerWidth <= 768) {
                        setCollapsed(true);
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="menu-label">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="theme-label">
              {darkTheme ? (
                <Sun className="w-5 h-5 theme-icon" />
              ) : (
                <Moon className="w-5 h-5 theme-icon" />
              )}
              <span className="theme-text">
                {darkTheme ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>
            <div className="theme-toggle-track">
              <div className="theme-toggle-indicator" />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}