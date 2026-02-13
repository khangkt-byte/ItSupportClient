import { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronDown, RotateCcw, Eye, Sun, Moon, MonitorSmartphone, CheckCircle } from 'lucide-react';
import { useTheme } from '@/features/theme/hooks/useTheme';
import type { Theme, Appearance, BrandColorTheme } from '@/features/theme/hooks/useTheme';
import { palettes } from '@/constants/palettes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Appearance option interface
 * Following Apple HIG and Material Design 3 patterns
 * @reference https://developer.apple.com/design/human-interface-guidelines/dark-mode/
 */
interface AppearanceOption {
  value: Appearance;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

/**
 * Brand color option interface
 * Independent from appearance - can combine with any light/dark mode
 */
interface BrandColorOption {
  value: BrandColorTheme;
  label: string;
  color?: string;
  description?: string;
}

/**
 * Appearance Options (NEW - Option A Architecture)
 * 
 * Following Apple HIG and Material Design 3 Best Practices:
 * - Light: Always uses light appearance
 * - Dark: Always uses dark appearance  
 * - Auto: Follows system preference (prefers-color-scheme)
 * 
 * References:
 * - Apple HIG Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode/
 * - Material Design 3 Dark Theme: https://m3.material.io/styles/color/dark-theme/overview
 * - Windows Settings: Appearance separated from accent color
 * - macOS System Preferences: Appearance + Accent Color model
 * 
 * Why Auto is recommended:
 * "Avoid offering an app-specific appearance setting... people can choose the Auto
 * appearance setting, which switches between the light and dark appearances as
 * conditions change throughout the day" - Apple HIG
 * 
 * @reference https://developer.apple.com/design/human-interface-guidelines/dark-mode/#Best-practices
 */
const appearanceOptions: AppearanceOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Always use light appearance',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Always use dark appearance',
  },
  {
    value: 'auto',
    label: 'Auto',
    icon: MonitorSmartphone,
    description: 'Follow system preference',
  },
];

/**
 * Brand Color Options (NEW - Option A Architecture)
 * 
 * Independent from appearance - works with any light/dark mode
 * Following Material Design 3 "seed color" pattern
 * 
 * References:
 * - Material Design 3 Color Roles: https://m3.material.io/styles/color/roles
 * - Fluent 2 Theme Tokens: https://fluent2.microsoft.design/design-tokens
 * - Design Tokens as SSOT: All colors from palettes.ts
 * 
 * Architecture Benefits:
 * ✅ Appearance + Brand Color = Combinatorial (N × M options)
 * ✅ Respects system preference when Auto selected
 * ✅ Brand colors work in both light and dark contexts
 * ✅ Follows Apple, Google, Microsoft patterns
 * 
 * @see palettes.ts - Central design token definitions
 */
const brandColorOptions: BrandColorOption[] = [
  {
    value: 'default',
    label: 'Default',
    description: 'Standard theme colors',
  },
  {
    value: 'brand-purple',
    label: 'Purple',
    color: palettes['brand-purple'].primary[500],
    description: 'Professional purple',
  },
  {
    value: 'brand-red',
    label: 'Red',
    color: palettes['brand-red'].primary[500],
    description: 'Energetic red',
  },
  {
    value: 'brand-blue',
    label: 'Blue',
    color: palettes['brand-blue'].primary[500],
    description: 'Trustworthy blue',
  },
  {
    value: 'brand-green',
    label: 'Green',
    color: palettes['brand-green'].primary[500],
    description: 'Fresh green',
  },
  {
    value: 'brand-orange',
    label: 'Orange',
    color: palettes['brand-orange'].primary[500],
    description: 'Vibrant orange',
  },
  {
    value: 'brand-teal',
    label: 'Teal',
    color: palettes['brand-teal'].primary[500],
    description: 'Calm teal',
  },
  {
    value: 'brand-indigo',
    label: 'Indigo',
    color: palettes['brand-indigo'].primary[500],
    description: 'Modern indigo',
  },
  {
    value: 'brand-violet',
    label: 'Violet',
    color: palettes['brand-violet'].primary[500],
    description: 'Creative violet',
  },
  {
    value: 'brand-pink',
    label: 'Pink',
    color: palettes['brand-pink'].primary[500],
    description: 'Bold pink',
  },
  {
    value: 'brand-cyan',
    label: 'Cyan',
    color: palettes['brand-cyan'].primary[500],
    description: 'Tech cyan',
  },
];

interface SemanticColorInfo {
  name: string;
  value: string;
  usage: string;
}

/**
 * Enhanced Theme Selector Component
 * Features:
 * - Visual theme grid with live preview
 * - Category grouping (Light/Dark/Brand)
 * - Semantic color preview
 * - Theme history with undo
 * - Performance < 100ms
 * 
 * Phase 4: Advanced Theme Management
 * @component
 */

interface ThemeSelectorProps {
  collapsed?: boolean;
}

export function ThemeSelector({ collapsed = false }: ThemeSelectorProps) {
  // NEW: Use combinatorial appearance + brand color API (Option A)
  const { 
    appearance, 
    brandColor,
    resolvedAppearance,
    setAppearance, 
    setBrandColor,
    theme: currentTheme, // Legacy for backwards compatibility
  } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSemanticColors, setShowSemanticColors] = useState(false);

  // Reset to defaults (Auto appearance + Default brand color)
  const reset = useCallback(() => {
    setAppearance('auto');
    setBrandColor('default');
  }, [setAppearance, setBrandColor]);

  // Get semantic colors for current theme
  const getSemanticColors = useCallback((themeValue: Theme): SemanticColorInfo[] => {
    const getCSSVariable = (varName: string): string => {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    };

    // Temporarily apply theme to get colors
    const original = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', themeValue);

    const colors: SemanticColorInfo[] = [
      { name: 'Success', value: getCSSVariable('--color-success'), usage: 'Completed, Valid' },
      { name: 'Warning', value: getCSSVariable('--color-warning'), usage: 'Pending, Caution' },
      { name: 'Error', value: getCSSVariable('--color-error'), usage: 'Failed, Invalid' },
      { name: 'Info', value: getCSSVariable('--color-info'), usage: 'In Progress' },
    ];

    // Restore original
    if (original) {
      document.documentElement.setAttribute('data-theme', original);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    return colors;
  }, []);

  const semanticColors = useMemo(
    () => getSemanticColors(currentTheme),
    [currentTheme, getSemanticColors]
  );

  // Get display labels for sidebar button
  const appearanceLabel = appearanceOptions.find(a => a.value === appearance)?.label || 'Auto';
  const brandLabel = brandColorOptions.find(b => b.value === brandColor)?.label || 'Default';
  const displayLabel = brandColor === 'default' ? appearanceLabel : `${appearanceLabel} · ${brandLabel}`;

  return (
    <>
      {/* Theme Selector Button in Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full min-h-12 rounded-lg flex items-center border-none px-3.75 whitespace-nowrap transition-all duration-300 hover:bg-(--sidebar-color-hover-secondary) bg-(--sidebar-color-bg-secondary) text-(--sidebar-color-text-primary)"
        title={`Appearance: ${appearanceLabel}, Brand: ${brandLabel}`}
      >
        <div className="flex gap-2.5 items-center flex-1">
          <span className="material-symbols-rounded">palette</span>
          <span className={`text-base transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden absolute' : 'opacity-100'}`}>{displayLabel}</span>
        </div>
        {!collapsed && <Eye className="w-4 h-4 opacity-60" />}
      </button>

      {/* Theme Selector Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl bg-card border border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              ✨ Theme Selector & Preview
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Controls */}
            <div className="flex gap-2 flex-wrap items-center justify-between border-b border-border pb-4">
              <button
                onClick={reset}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-accent text-foreground hover:bg-secondary"
                title="Reset to Auto appearance and Default brand color"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>

              <div className="text-sm text-muted-foreground">
                Current: {appearanceOptions.find(a => a.value === appearance)?.label}
                {appearance === 'auto' && <span className="ml-1 px-2 py-0.5 bg-info-background text-info-foreground rounded text-xs">→ {resolvedAppearance}</span>}
                {' + '}
                {brandColorOptions.find(b => b.value === brandColor)?.label}
              </div>
            </div>

            {/* Appearance Selector */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Appearance
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Choose how the interface looks. Auto mode follows your system preference.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {appearanceOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = appearance === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setAppearance(option.value)}
                      className={`
                        relative h-24 rounded-lg border-2 p-3 transition-all
                        flex flex-col items-center justify-center gap-2
                        ${isActive 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 shadow-lg' 
                          : 'border-border bg-card hover:border-primary-300 hover:bg-accent'
                        }
                      `}
                      title={option.description}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-foreground'}`} />
                      <span className={`text-sm font-medium ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-foreground'}`}>
                        {option.label}
                      </span>
                      {isActive && option.value === 'auto' && (
                        <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-info-background text-info-foreground rounded text-xs font-medium">
                          → {resolvedAppearance}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute top-1 left-1">
                          <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Color Selector */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Brand Colors
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Select a brand color to customize the interface. Works with any appearance setting.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {brandColorOptions.map((option) => {
                  const isActive = brandColor === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setBrandColor(option.value)}
                      className={`
                        relative h-24 rounded-lg border-2 p-3 transition-all
                        flex flex-col items-center justify-center gap-2
                        ${isActive 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 shadow-lg' 
                          : 'border-border bg-card hover:border-primary-300 hover:bg-accent'
                        }
                      `}
                      title={option.description}
                    >
                      {option.color && (
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      {!option.color && (
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">A</span>
                        </div>
                      )}
                      <span className={`text-sm font-medium text-center ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-foreground'}`}>
                        {option.label}
                      </span>
                      {isActive && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Semantic Colors Preview */}
            <div className="bg-muted rounded-lg p-4 border border-border">
              <button
                onClick={() => setShowSemanticColors(!showSemanticColors)}
                className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3 hover:opacity-70 transition-opacity"
              >
                {showSemanticColors ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Semantic Colors Preview ({currentTheme})
              </button>

              {showSemanticColors && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {semanticColors.map((color) => (
                    <div key={color.name} className="space-y-2">
                      <div
                        className="w-full h-16 rounded-lg border-2 border-border shadow-sm transition-all"
                        style={{
                          backgroundColor: color.value,
                          borderColor: getColorBrightness(color.value) > 128 ? 'var(--color-border-secondary)' : 'var(--color-border-primary)',
                        }}
                        title={`${color.value}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{color.name}</p>
                        <p className="text-xs text-muted-foreground">{color.usage}</p>
                        <code className="text-xs text-muted-foreground font-mono">{color.value}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-info-background border border-info-border rounded-lg p-4">
              <p className="text-sm text-info-foreground">
                <span className="font-semibold">💡 Tip:</span> Your theme preferences are saved to your browser. 
                {appearance === 'auto' && ' Auto mode will automatically switch based on your system preference.'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Utility function to determine color brightness
 */
function getColorBrightness(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate brightness
  return (r * 299 + g * 587 + b * 114) / 1000;
}