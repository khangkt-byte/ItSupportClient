import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { BrandTheme, palettes } from '../lib/constants/palettes';
import { useTheme } from '../lib/hooks/useTheme';
import type { Theme } from '../lib/hooks/useTheme';

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

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  materialIcon: string;
  color?: string;
}

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, materialIcon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, materialIcon: 'dark_mode' },
  { value: 'brand-purple', label: 'Purple', icon: <Palette className="w-4 h-4 text-purple-500" />, materialIcon: 'palette', color: '#695CFE' },
  { value: 'brand-red', label: 'Red', icon: <Palette className="w-4 h-4 text-red-500" />, materialIcon: 'palette', color: '#ef4444' },
  { value: 'brand-blue', label: 'Blue', icon: <Palette className="w-4 h-4 text-blue-500" />, materialIcon: 'palette', color: '#3b82f6' },
  { value: 'brand-green', label: 'Green', icon: <Palette className="w-4 h-4 text-green-500" />, materialIcon: 'palette', color: '#22c55e' },
  { value: 'brand-orange', label: 'Orange', icon: <Palette className="w-4 h-4 text-orange-500" />, materialIcon: 'palette', color: '#ea580c' },
  { value: 'brand-teal', label: 'Teal', icon: <Palette className="w-4 h-4 text-teal-500" />, materialIcon: 'palette', color: '#14b8a6' },
  { value: 'brand-indigo', label: 'Indigo', icon: <Palette className="w-4 h-4 text-indigo-500" />, materialIcon: 'palette', color: '#6366f1' },
  { value: 'brand-violet', label: 'Violet', icon: <Palette className="w-4 h-4 text-violet-500" />, materialIcon: 'palette', color: '#a855f7' },
  { value: 'brand-pink', label: 'Pink', icon: <Palette className="w-4 h-4 text-pink-500" />, materialIcon: 'palette', color: '#ec4899' },
  { value: 'brand-cyan', label: 'Cyan', icon: <Palette className="w-4 h-4 text-cyan-500" />, materialIcon: 'palette', color: '#1e88ff' },
];

export function Sidebar({ currentView, onNavigate, userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, changeTheme, accessibilityMode, setAccessibilityMode, prefersReducedMotion } = useTheme();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Expand sidebar by default on large screens
  useEffect(() => {
    if (window.innerWidth > 768) {
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, []);

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
      <aside 
        className={`sticky top-0 h-screen flex flex-shrink-0 flex-col bg-[var(--sidebar-color-bg-sidebar)] border-r border-[var(--sidebar-color-border-hr)] transition-[width] duration-[400ms] ${collapsed ? 'w-[90px]' : 'w-[270px]'} sidebar-container ${collapsed ? 'collapsed' : ''}`} 
        style={{ 
          boxShadow: '0 3px 9px var(--sidebar-color-shadow)',
          transitionDuration: prefersReducedMotion ? '0ms' : '400ms'
        }}
      >
        {/* Sidebar header */}
        <div className="py-5 px-[18px] flex relative items-center justify-between border-b border-[var(--sidebar-color-border-hr)]">
          <div className="flex items-center gap-3">
            <span 
              className={`material-symbols-rounded block object-contain rounded-full transition-opacity ${prefersReducedMotion ? 'duration-0' : 'duration-[400ms]'} ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              style={{ color: '#695CFE', fontSize: '46px', width: '46px', height: '46px' }}
            >
              headset_mic
            </span>
            <span className={`font-semibold text-lg whitespace-nowrap transition-opacity ${prefersReducedMotion ? 'duration-0' : 'duration-300'} text-[var(--sidebar-color-text-primary)] ${collapsed ? 'opacity-0 pointer-events-none absolute w-0 overflow-hidden' : 'opacity-100'}`}>
              IT Support
            </span>
          </div>
          <button 
            className={`h-10 w-10 border-none cursor-pointer flex absolute right-[18px] items-center justify-center rounded-lg transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-[400ms]'} hover:bg-[var(--sidebar-color-hover-secondary)] bg-[var(--sidebar-color-bg-secondary)] text-[var(--sidebar-color-text-primary)] ${collapsed ? '-translate-x-0.5 h-12 w-[50px]' : ''} sidebar-toggle-btn`}
            onClick={toggleSidebar}
          >
            <span className={`material-symbols-rounded text-[1.75rem] transition-transform ${prefersReducedMotion ? 'duration-0' : 'duration-[400ms]'} ${collapsed ? 'rotate-180' : ''}`}>chevron_left</span>
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
            onClick={() => setIsThemeModalOpen(true)}
            className="w-full min-h-[48px] rounded-lg flex items-center cursor-pointer border-none px-[15px] whitespace-nowrap transition-all duration-300 hover:bg-[var(--sidebar-color-hover-secondary)] bg-[var(--sidebar-color-bg-secondary)] text-[var(--sidebar-color-text-primary)]"
          >
            <div className="flex gap-[10px] items-center">
              <span className="material-symbols-rounded">{currentThemeOption.materialIcon}</span>
              <span className={`text-base ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`} style={{ transition: collapsed ? 'all 0.2s ease' : 'opacity 0.4s 0.2s ease' }}>{currentThemeOption.label}</span>
            </div>
          </button>
        </div>

        {/* Theme Modal */}
        <Dialog open={isThemeModalOpen} onOpenChange={setIsThemeModalOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">Choose Theme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Accessibility Mode Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Accessibility</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAccessibilityMode('default')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      accessibilityMode === 'default'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Normal Contrast
                  </button>
                  <button
                    onClick={() => setAccessibilityMode('highContrast')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      accessibilityMode === 'highContrast'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    High Contrast
                  </button>
                </div>
                {prefersReducedMotion && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">✓ Reduced motion is enabled in system settings</p>
                )}
              </div>

              {/* Theme Selection Grid */}
              <div className="max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Color Themes</h3>
                <div className="grid grid-cols-3 gap-4">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        changeTheme(option.value);
                        setIsThemeModalOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        theme === option.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-2xl">{option.icon}</div>
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-50 text-center">{option.label}</div>
                      {option.color && (
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      {theme === option.value && (
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-primary-600 -mt-1">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </aside>
    </>
  );
}