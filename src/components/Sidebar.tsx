import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sun, Moon, Palette, Check } from 'lucide-react';

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

type Theme = 'light' | 'dark' | 'brand-red' | 'brand-blue';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  materialIcon: string;
}

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, materialIcon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, materialIcon: 'dark_mode' },
  { value: 'brand-red', label: 'Red Theme', icon: <Palette className="w-4 h-4 text-red-500" />, materialIcon: 'palette' },
  { value: 'brand-blue', label: 'Blue Theme', icon: <Palette className="w-4 h-4 text-blue-500" />, materialIcon: 'palette' },
];

export function Sidebar({ currentView, onNavigate, userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  const applyTheme = (nextTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.body.setAttribute('data-theme', nextTheme);
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme: Theme = 'light';
    if (savedTheme && themeOptions.some(opt => opt.value === savedTheme)) {
      initialTheme = savedTheme;
    } else if (systemPrefersDark) {
      initialTheme = 'dark';
    }

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

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const currentThemeOption = themeOptions.find(opt => opt.value === theme) || themeOptions[0];

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-full min-h-[48px] rounded-lg flex items-center cursor-pointer border-none px-[15px] whitespace-nowrap transition-all duration-300 hover:bg-[var(--sidebar-color-hover-secondary)] bg-[var(--sidebar-color-bg-secondary)] text-[var(--sidebar-color-text-primary)]"
              >
                <div className="flex gap-[10px] items-center">
                  <span className="material-symbols-rounded">{currentThemeOption.materialIcon}</span>
                  <span className={`text-base ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`} style={{ transition: collapsed ? 'all 0.2s ease' : 'opacity 0.4s 0.2s ease' }}>{currentThemeOption.label}</span>
                </div>
                <span className={`material-symbols-rounded ml-auto ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`} style={{ transition: collapsed ? 'all 0.2s ease' : 'opacity 0.4s 0.2s ease' }}>expand_more</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              {themeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => changeTheme(option.value)}
                  className="flex items-center gap-3 cursor-pointer px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <span className="flex-shrink-0">{option.icon}</span>
                  <span className="flex-1 text-sm font-medium">{option.label}</span>
                  {theme === option.value && (
                    <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}