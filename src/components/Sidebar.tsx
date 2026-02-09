import { useState, useEffect } from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string; // Material Symbols icon name
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
    document.body.classList.toggle('dark-theme', shouldUseDarkTheme);
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

  const adminMenuItems: MenuItem[] = [
    { id: 'admin', label: 'Dashboard', icon: 'dashboard' },
    { id: 'workLogs', label: 'Work Logs', icon: 'insert_chart' },
    { id: 'employees', label: 'Employees', icon: 'group' },
    { id: 'departments', label: 'Departments', icon: 'business' },
    { id: 'areas', label: 'Areas', icon: 'location_on' },
    { id: 'accounts', label: 'Accounts', icon: 'account_circle' },
    { id: 'roles', label: 'Roles', icon: 'shield' },
  ];

  const employeeMenuItems: MenuItem[] = [
    { id: 'employee', label: 'Dashboard', icon: 'dashboard' },
    { id: 'workLogs', label: 'Work Logs', icon: 'insert_chart' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile navbar */}
      <nav className="site-nav">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <span className="material-symbols-rounded">menu</span>
        </button>
      </nav>

      {/* Sidebar */}
      <aside className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
        {/* Sidebar header */}
        <div className="sidebar-header">
          <div className="flex items-center gap-3">
            <span className="material-symbols-rounded header-logo" style={{ color: '#695CFE', fontSize: '46px' }}>
              headset_mic
            </span>
            <span className={`font-semibold text-lg whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none absolute w-0 overflow-hidden' : 'opacity-100'}`} style={{ color: 'var(--sidebar-color-text-primary)' }}>
              IT Support
            </span>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
        </div>

        <div className="sidebar-content">
          {/* Sidebar Menu */}
          <ul className="menu-list">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id} className="menu-item">
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`menu-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="material-symbols-rounded">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="theme-label">
              <span className="theme-icon material-symbols-rounded">dark_mode</span>
              <span className="theme-text">Dark Mode</span>
            </div>
            <div className="theme-toggle-track">
              <div className="theme-toggle-indicator"></div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}