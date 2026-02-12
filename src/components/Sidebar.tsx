import { useState, useEffect } from 'react';
import { useTheme } from '../lib/hooks/useTheme';
import { ThemeSelector } from './ThemeSelector';

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
  const { accessibilityMode, setAccessibilityMode, prefersReducedMotion } = useTheme();
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  // Expand sidebar by default on large screens
  useEffect(() => {
    if (window.innerWidth > 768) {
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, []);

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
    { id: 'test-themes', label: 'Theme Testing', icon: 'palette' },
  ];

  const employeeMenuItems: MenuItem[] = [
    { id: 'employee', label: 'Dashboard', icon: 'dashboard' },
    { id: 'workLogs', label: 'Work Logs', icon: 'insert_chart' },
    { id: 'test-themes', label: 'Theme Testing', icon: 'palette' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile navbar */}
      <nav className="site-nav sticky top-0 hidden max-md:block px-5 py-3.75 border-b bg-(--sidebar-color-bg-primary) border-(--sidebar-color-border-hr)">
        <button 
          className="h-10 w-10 border-none flex items-center justify-center rounded-lg right-5 transition-all duration-400 hover:bg-(--sidebar-color-hover-secondary) bg-(--sidebar-color-bg-secondary) text-(--sidebar-color-text-primary)"
          onClick={toggleSidebar}
        >
          <span className="material-symbols-rounded text-[1.75rem]">menu</span>
        </button>
      </nav>

      {/* Sidebar */}
      <aside 
        className={`sticky top-0 h-screen flex shrink-0 flex-col bg-(--sidebar-color-bg-sidebar) border-r border-(--sidebar-color-border-hr) transition-[width] duration-400 ${collapsed ? 'w-22.5' : 'w-67.5'} sidebar-container ${collapsed ? 'collapsed' : ''}`} 
        style={{ 
          boxShadow: '0 3px 9px var(--sidebar-color-shadow)',
          transitionDuration: prefersReducedMotion ? '0ms' : '400ms'
        }}
      >
        {/* Sidebar header */}
        <div className="py-5 px-4.5 flex relative items-center justify-between border-b border-(--sidebar-color-border-hr)">
          <div className="flex items-center gap-3">
            <span 
              className={`material-symbols-rounded block object-contain rounded-full transition-opacity ${prefersReducedMotion ? 'duration-0' : 'duration-400'} ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              style={{ color: 'var(--color-primary-500)', fontSize: '46px', width: '46px', height: '46px' }}
            >
              headset_mic
            </span>
            <span className={`font-semibold text-lg whitespace-nowrap transition-opacity ${prefersReducedMotion ? 'duration-0' : 'duration-300'} text-(--sidebar-color-text-primary) ${collapsed ? 'opacity-0 pointer-events-none absolute w-0 overflow-hidden' : 'opacity-100'}`}>
              IT Support
            </span>
          </div>
          <button 
            className={`h-10 w-10 border-none flex absolute right-4.5 items-center justify-center rounded-lg transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-400'} hover:bg-(--sidebar-color-hover-secondary) bg-(--sidebar-color-bg-secondary) text-(--sidebar-color-text-primary) ${collapsed ? '-translate-x-0.5 h-12 w-12.5' : ''} sidebar-toggle-btn`}
            onClick={toggleSidebar}
          >
            <span className={`material-symbols-rounded text-[1.75rem] transition-transform ${prefersReducedMotion ? 'duration-0' : 'duration-400'} ${collapsed ? 'rotate-180' : ''}`}>chevron_left</span>
          </button>
        </div>

        <div className={`flex-1 py-5 px-4.5 overflow-hidden overflow-y-auto ${collapsed ? 'scrollbar-none' : ''}`} style={{ scrollbarWidth: collapsed ? 'none' : 'thin', scrollbarColor: 'var(--sidebar-color-text-placeholder) transparent' }}>
          {/* Sidebar Menu */}
          <ul className="flex gap-1 list-none flex-col">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`flex gap-3 whitespace-nowrap rounded-lg py-3 px-3.75 items-center no-underline transition-all duration-300 border-none bg-none w-full ${isActive ? 'text-white bg-(--sidebar-color-hover-primary)' : 'text-(--sidebar-color-text-primary) hover:text-white hover:bg-(--sidebar-color-hover-primary)'}`}
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
        <div className="py-5 px-4.5 border-t border-(--sidebar-color-border-hr) space-y-3">
          {/* New Theme Selector Component */}
          <ThemeSelector />

          {/* Accessibility Mode Button */}
          <button
            onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
            className="w-full min-h-12 rounded-lg flex items-center border-none px-3.75 whitespace-nowrap transition-all duration-300 hover:bg-(--sidebar-color-hover-secondary) bg-(--sidebar-color-bg-secondary) text-(--sidebar-color-text-primary)"
            title="Accessibility options"
          >
            <div className="flex gap-2.5 items-center flex-1">
              <span className="material-symbols-rounded">accessibility</span>
              <span className={`text-base ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`} style={{ transition: collapsed ? 'all 0.2s ease' : 'opacity 0.4s 0.2s ease' }}>
                Accessibility
              </span>
            </div>
          </button>

          {/* Accessibility Options Dropdown */}
          {isAccessibilityOpen && (
            <div className="bg-(--sidebar-color-bg-secondary) rounded-lg p-3 space-y-2 border border-(--sidebar-color-border-hr) hidden md:block">
              <p className="text-xs font-semibold text-(--sidebar-color-text-primary) mb-2">Contrast Mode:</p>
              <button
                onClick={() => setAccessibilityMode('default')}
                className={`w-full px-3 py-2 rounded text-sm font-medium transition-all text-left ${
                  accessibilityMode === 'default'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-50 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                ✓ Normal
              </button>
              <button
                onClick={() => setAccessibilityMode('highContrast')}
                className={`w-full px-3 py-2 rounded text-sm font-medium transition-all text-left ${
                  accessibilityMode === 'highContrast'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-50 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                ⊕ High Contrast (AA+)
              </button>
              {prefersReducedMotion && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">✓ Reduced motion enabled</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}