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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = (nextTheme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.body.setAttribute('data-theme', nextTheme);
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme === 'dark' || (!savedTheme && systemPrefersDark) ? 'dark' : 'light';

    setTheme(initialTheme);
    applyTheme(initialTheme);
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
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
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
      <nav className="site-nav sticky top-0 hidden max-md:block px-5 py-[15px] border-b bg-[var(--sidebar-color-bg-primary)] border-[var(--sidebar-color-border-hr)]">
        <button 
          className="h-10 w-10 border-none cursor-pointer flex items-center justify-center rounded-lg absolute right-5 transition-all duration-[400ms] hover:bg-[var(--sidebar-color-hover-secondary)] bg-[var(--sidebar-color-bg-secondary)] text-[var(--sidebar-color-text-primary)] [position:unset]"
          onClick={toggleSidebar}
        >
          <span className="material-symbols-rounded text-[1.75rem]">menu</span>
        </button>
      </nav>

      {/* Sidebar */}
      <aside className={`sticky top-0 h-screen flex flex-shrink-0 flex-col bg-[var(--sidebar-color-bg-sidebar)] border-r border-[var(--sidebar-color-border-hr)] transition-[width] duration-[400ms] ${collapsed ? 'w-[90px]' : 'w-[270px]'} sidebar-container ${collapsed ? 'collapsed' : ''}`} style={{ boxShadow: '0 3px 9px var(--sidebar-color-shadow)' }}>
        {/* Sidebar header */}
        <div className="py-5 px-[18px] flex relative items-center justify-between border-b border-[var(--sidebar-color-border-hr)]">
          <div className="flex items-center gap-3">
            <span 
              className={`material-symbols-rounded block object-contain rounded-full transition-opacity duration-[400ms] ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              style={{ color: '#695CFE', fontSize: '46px', width: '46px', height: '46px' }}
            >
              headset_mic
            </span>
            <span className={`font-semibold text-lg whitespace-nowrap transition-opacity duration-300 text-[var(--sidebar-color-text-primary)] ${collapsed ? 'opacity-0 pointer-events-none absolute w-0 overflow-hidden' : 'opacity-100'}`}>
              IT Support
            </span>
          </div>
          <button 
            className={`h-10 w-10 border-none cursor-pointer flex absolute right-[18px] items-center justify-center rounded-lg transition-all duration-[400ms] hover:bg-[var(--sidebar-color-hover-secondary)] bg-[var(--sidebar-color-bg-secondary)] text-[var(--sidebar-color-text-primary)] ${collapsed ? '-translate-x-0.5 h-12 w-[50px]' : ''} sidebar-toggle-btn`}
            onClick={toggleSidebar}
          >
            <span className={`material-symbols-rounded text-[1.75rem] transition-transform duration-[400ms] ${collapsed ? 'rotate-180' : ''}`}>chevron_left</span>
          </button>
        </div>

        <div className={`flex-1 py-5 px-[18px] overflow-hidden overflow-y-auto ${collapsed ? 'scrollbar-none' : ''}`} style={{ scrollbarWidth: collapsed ? 'none' : 'thin', scrollbarColor: 'var(--sidebar-color-text-placeholder) transparent' }}>
          {/* Sidebar Menu */}
          <ul className="flex gap-1 list-none flex-col">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`flex gap-3 whitespace-nowrap rounded-lg py-3 px-[15px] items-center no-underline transition-all duration-300 border-none bg-none w-full cursor-pointer font-['Poppins',sans-serif] ${isActive ? 'text-white bg-[var(--sidebar-color-hover-primary)]' : 'text-[var(--sidebar-color-text-primary)] hover:text-white hover:bg-[var(--sidebar-color-hover-primary)]'}`}
                  >
                    <span className="material-symbols-rounded">{item.icon}</span>
                    <span className={`transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="py-5 px-[18px] whitespace-nowrap border-t border-[var(--sidebar-color-border-hr)]">
          <button 
            className="w-full min-h-[48px] rounded-lg flex items-center cursor-pointer border-none px-[15px] whitespace-nowrap transition-all duration-300 hover:bg-[var(--sidebar-color-hover-secondary)] bg-[var(--sidebar-color-bg-secondary)] text-[var(--sidebar-color-text-primary)]"
            onClick={toggleTheme}
          >
            <div className="flex gap-[10px] items-center">
              <span className="material-symbols-rounded">dark_mode</span>
              <span className={`text-base ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`} style={{ transition: collapsed ? 'all 0.2s ease' : 'opacity 0.4s 0.2s ease' }}>Dark Mode</span>
            </div>
            <div 
              className={`ml-auto h-6 w-12 rounded-full relative ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
              style={{ 
                background: theme === 'dark' ? '#695CFE' : '#c3d1ec',
                transition: collapsed ? 'all 0.2s ease' : 'opacity 0.4s 0.2s ease, background-color 0.3s ease'
              }}
            >
              <div 
                className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-300"
                style={{ transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}