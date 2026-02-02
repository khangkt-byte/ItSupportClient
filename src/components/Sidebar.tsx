import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
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
      <nav className="sticky top-0 hidden max-md:block px-5 py-[15px] border-b z-[5]" style={{ 
        background: 'var(--color-bg-primary)', 
        borderColor: 'var(--color-border-hr)' 
      }}>
        <button 
          className="h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-300"
          style={{ 
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)'
          }}
          onClick={toggleSidebar}
        >
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
      <aside 
        className={`
          sticky top-0 h-screen flex-shrink-0 flex flex-col border-r shadow-md transition-all duration-300 z-20
          ${collapsed ? 'w-[90px] max-md:-left-[270px]' : 'w-[270px]'}
          max-md:fixed max-md:top-0 max-md:left-0 max-md:w-[270px] max-md:transition-left
        `}
        style={{ 
          background: 'var(--color-bg-sidebar)', 
          borderColor: 'var(--color-border-hr)',
          boxShadow: '0 3px 9px var(--color-shadow)'
        }}
      >
        {/* Sidebar header */}
        <div className="px-[18px] py-5 flex items-center justify-between border-b relative" style={{ borderColor: 'var(--color-border-hr)' }}>
          <div className="flex items-center gap-3">
            <div className={`transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <span 
              className={`font-semibold text-lg whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none absolute w-0 overflow-hidden' : 'opacity-100'}`}
              style={{ color: 'var(--color-text-primary)' }}
            >
              IT Support
            </span>
          </div>
          
          <button 
            className={`
              h-10 w-10 flex items-center justify-center rounded-lg absolute right-[18px] transition-all duration-300
              ${collapsed ? 'translate-x-[-2px] h-12 w-[50px]' : ''}
            `}
            style={{ 
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)'
            }}
            onClick={toggleSidebar}
          >
            <ChevronLeft className={`w-6 h-6 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Sidebar content */}
        <div className={`flex-1 px-[18px] py-5 overflow-y-auto ${collapsed ? 'scrollbar-none' : 'scrollbar-thin'}`}>
          <ul className="flex flex-col gap-1 list-none">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-[15px] py-3 rounded-lg whitespace-nowrap transition-all duration-300
                      ${collapsed ? 'justify-center px-0' : 'justify-start'}
                      ${isActive ? 'text-white' : ''}
                    `}
                    style={{
                      color: isActive ? '#fff' : 'var(--color-text-primary)',
                      background: isActive ? 'var(--color-hover-primary)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--color-hover-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className={`transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none absolute w-0 overflow-hidden' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar footer - Theme toggle */}
        <div className="px-[18px] py-5 border-t whitespace-nowrap" style={{ borderColor: 'var(--color-border-hr)' }}>
          <button 
            className="w-full min-h-[48px] rounded-lg flex items-center px-[15px] transition-all duration-300"
            style={{ 
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)'
            }}
            onClick={toggleTheme}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-hover-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-secondary)';
            }}
          >
            <div className="flex items-center gap-[10px]">
              {darkTheme ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className={`text-base transition-all ${collapsed ? 'opacity-0 w-0' : 'opacity-100 transition-opacity delay-200'}`}>
                {darkTheme ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            
            {/* Toggle track */}
            <div 
              className={`
                ml-auto h-6 w-12 rounded-full relative transition-all
                ${collapsed ? 'opacity-0 w-0' : 'opacity-100 delay-200'}
              `}
              style={{ background: darkTheme ? '#695CFE' : '#c3d1ec' }}
            >
              <div 
                className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-300"
                style={{ transform: darkTheme ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
