import { useState } from 'react';
import {
    Copy,
    Download,
    Save,
    RotateCcw,
    Trash2,
    Check,
    AlertCircle,
    Palette,
} from 'lucide-react';
import { useColorBuilder } from '@/features/theme/hooks/useColorBuilder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * CustomColorBuilder Component
 * 
 * Visual color theme builder with accessibility checking
 * Allows users to create custom brand color schemes
 * 
 * Features:
 * - Color picker for base color
 * - Automatic color scale generation
 * - Semantic color generation
 * - Accessibility WCAG checking
 * - Save/load themes
 * - Export as CSS or JavaScript
 * - Real-time preview
 * 
 * @component
 */
export function CustomColorBuilder() {
    const {
        baseColor,
        themeName,
        lightBg,
        darkBg,
        savedThemes,
        setBaseColor,
        setThemeName,
        setLightBg,
        setDarkBg,
        // colorScale,
        semanticColors,
        harmonyColors,
        // allColors,
        accessibilityCheck,
        getLabeledScale,
        exportCSS,
        exportJS,
        saveTheme,
        loadTheme,
        deleteTheme,
        reset,
    } = useColorBuilder();

    const [copiedColor, setCopiedColor] = useState<string | null>(null);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportFormat, setExportFormat] = useState<'css' | 'js'>('css');

    // Copy to clipboard helper
    const copyToClipboard = (text: string, colorName?: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedColor(colorName || text);
            setTimeout(() => setCopiedColor(null), 2000);
        });
    };

    // Color swatch component
    const ColorSwatch = ({
        color,
        label,
        showCopy = true,
    }: {
        color: string;
        label: string;
        showCopy?: boolean;
    }) => {
        const isCopied = copiedColor === color;
        return (
            <div className="flex flex-col items-center gap-2">
                <div
                    className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors shadow-sm relative group"
                    style={{ backgroundColor: color }}
                    onClick={() => showCopy && copyToClipboard(color, color)}
                    title={showCopy ? 'Click to copy' : ''}
                >
                    {showCopy && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors">
                            {isCopied ? (
                                <Check className="w-5 h-5 text-white" />
                            ) : (
                                <Copy className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                    <p className="text-xs font-mono text-gray-500 mt-1">{color}</p>
                </div>
            </div>
        );
    };

    // Accessibility indicator
    const AccessibilityBadge = ({ passed, total }: { passed: number; total: number }) => {
        // const percentage = Math.round((passed / total) * 100);
        const isGood = passed === total;

        return (
            <Badge
                className={`${
                    isGood
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                }`}
            >
                {passed}/{total} WCAG AA ✓
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Palette className="w-6 h-6" />
                        Custom Color Builder
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Design your perfect brand color scheme
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={reset}
                    className="gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </Button>
            </div>

            {/* Theme Name and Base Color */}
            <Card className="p-6 space-y-4">
                <h3 className="font-semibold">Brand Foundation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Theme Name
                        </label>
                        <Input
                            value={themeName}
                            onChange={(e) => setThemeName(e.target.value)}
                            placeholder="Enter theme name..."
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Primary Brand Color
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={baseColor}
                                onChange={(e) => setBaseColor(e.target.value)}
                                className="h-10 w-16 rounded cursor-pointer border border-gray-300"
                            />
                            <Input
                                value={baseColor}
                                onChange={(e) => setBaseColor(e.target.value)}
                                placeholder="#2563eb"
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Background Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Light Background
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={lightBg}
                                onChange={(e) => setLightBg(e.target.value)}
                                className="h-10 w-16 rounded cursor-pointer border border-gray-300"
                            />
                            <Input
                                value={lightBg}
                                onChange={(e) => setLightBg(e.target.value)}
                                placeholder="#ffffff"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Dark Background
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={darkBg}
                                onChange={(e) => setDarkBg(e.target.value)}
                                className="h-10 w-16 rounded cursor-pointer border border-gray-300"
                            />
                            <Input
                                value={darkBg}
                                onChange={(e) => setDarkBg(e.target.value)}
                                placeholder="#1f2937"
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tabs for Different Views */}
            <Tabs defaultValue="scale" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="scale">Scale</TabsTrigger>
                    <TabsTrigger value="semantic">Semantic</TabsTrigger>
                    <TabsTrigger value="harmony">Harmony</TabsTrigger>
                    <TabsTrigger value="accessibility">Access.</TabsTrigger>
                </TabsList>

                {/* Color Scale Tab */}
                <TabsContent value="scale">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Color Scale (Tints & Shades)</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2">
                            {getLabeledScale().map((item: { label: string; color: string }) => (
                                <div
                                    key={item.label}
                                    onClick={() => copyToClipboard(item.color)}
                                    className="cursor-pointer"
                                >
                                    <ColorSwatch color={item.color} label={item.label} />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            Click any color to copy its hex value
                        </p>
                    </Card>
                </TabsContent>

                {/* Semantic Colors Tab */}
                <TabsContent value="semantic">
                    <Card className="p-6 space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Semantic Colors</h3>
                                <AccessibilityBadge
                                    passed={accessibilityCheck.passed}
                                    total={accessibilityCheck.total}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                                        Success
                                    </p>
                                    <ColorSwatch color={semanticColors.success} label="Success" />
                                    <div className="mt-3 text-xs text-gray-600">
                                        <p className="flex items-center gap-1">
                                            {accessibilityCheck.checks.successLight ? (
                                                <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-red-600" />
                                            )}
                                            Light BG
                                        </p>
                                        <p className="flex items-center gap-1 mt-1">
                                            {accessibilityCheck.checks.successDark ? (
                                                <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-red-600" />
                                            )}
                                            Dark BG
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                                        Warning
                                    </p>
                                    <ColorSwatch color={semanticColors.warning} label="Warning" />
                                    <div className="mt-3 text-xs text-gray-600">
                                        <p className="flex items-center gap-1">
                                            {accessibilityCheck.checks.warningLight ? (
                                                <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-red-600" />
                                            )}
                                            Light BG
                                        </p>
                                        <p className="flex items-center gap-1 mt-1">
                                            {accessibilityCheck.checks.warningDark ? (
                                                <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-red-600" />
                                            )}
                                            Dark BG
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                                        Error
                                    </p>
                                    <ColorSwatch color={semanticColors.error} label="Error" />
                                    <div className="mt-3 text-xs text-gray-600">
                                        <p className="flex items-center gap-1">
                                            {accessibilityCheck.checks.errorLight ? (
                                                <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-red-600" />
                                            )}
                                            Light BG
                                        </p>
                                        <p className="flex items-center gap-1 mt-1">
                                            {accessibilityCheck.checks.errorDark ? (
                                                <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-red-600" />
                                            )}
                                            Dark BG
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                                        Info
                                    </p>
                                    <ColorSwatch color={semanticColors.info} label="Info" />
                                    <div className="mt-3 text-xs text-gray-600">
                                        <p className="flex items-center gap-1">
                                            {accessibilityCheck.checks.infoLight ? (
                                                <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-red-600" />
                                            )}
                                            Light BG
                                        </p>
                                        <p className="flex items-center gap-1 mt-1">
                                            {accessibilityCheck.checks.infoDark ? (
                                                <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-red-600" />
                                            )}
                                            Dark BG
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Harmony Tab */}
                <TabsContent value="harmony">
                    <Card className="p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold mb-4">Color Harmony</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-4">
                                        Complementary Color
                                    </p>
                                    <div className="flex gap-4 items-end">
                                        <ColorSwatch color={baseColor} label="Primary" />
                                        <div className="text-2xl text-gray-400">↔</div>
                                        <ColorSwatch color={harmonyColors.complementary} label="Complement" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">
                                        Opposite colors on the color wheel for maximum contrast
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-4">
                                        Analogous Colors
                                    </p>
                                    <div className="flex gap-4 items-end">
                                        <ColorSwatch color={harmonyColors.analogous.left} label="Left" />
                                        <ColorSwatch color={baseColor} label="Primary" />
                                        <ColorSwatch color={harmonyColors.analogous.right} label="Right" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">
                                        Adjacent colors on the color wheel for harmonious palettes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Accessibility Tab */}
                <TabsContent value="accessibility">
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">WCAG Accessibility Check</h3>
                            <AccessibilityBadge
                                passed={accessibilityCheck.passed}
                                total={accessibilityCheck.total}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(accessibilityCheck.checks).map(([key, value]) => {
                                const parts = key.match(/([a-z]+)(Light|Dark)/i);
                                const color = parts?.[1] || '';
                                const bg = parts?.[2] || '';

                                return (
                                    <div
                                        key={key}
                                        className={`p-3 rounded-lg border-2 ${
                                            value
                                                ? 'bg-green-50 border-green-300'
                                                : 'bg-red-50 border-red-300'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                            {color} on {bg}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {value ? (
                                                <Check className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                            )}
                                            <span className="text-sm font-medium">
                                                {value ? 'Pass' : 'Fail'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <span className="font-semibold">💡 Tip:</span> All semantic colors should pass
                                WCAG AA on both light and dark backgrounds for best accessibility.
                            </p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="gap-2 flex-1">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Export Theme</DialogTitle>
                            <DialogDescription>
                                Choose your export format
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setExportFormat('css')}
                                    className={`flex-1 p-3 rounded border-2 transition-colors ${
                                        exportFormat === 'css'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    <p className="font-semibold text-sm">CSS Variables</p>
                                    <p className="text-xs text-gray-600 mt-1">Root CSS file</p>
                                </button>

                                <button
                                    onClick={() => setExportFormat('js')}
                                    className={`flex-1 p-3 rounded border-2 transition-colors ${
                                        exportFormat === 'js'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    <p className="font-semibold text-sm">JavaScript</p>
                                    <p className="text-xs text-gray-600 mt-1">TypeScript object</p>
                                </button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded font-mono text-sm max-h-40 overflow-auto">
                                {exportFormat === 'css' ? exportCSS() : exportJS()}
                            </div>

                            <Button
                                onClick={() => {
                                    const content =
                                        exportFormat === 'css' ? exportCSS() : exportJS();
                                    copyToClipboard(content);
                                    setShowExportDialog(false);
                                }}
                                className="w-full gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Copy to Clipboard
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => saveTheme()}
                    className="gap-2 flex-1"
                >
                    <Save className="w-4 h-4" />
                    Save Theme
                </Button>
            </div>

            {/* Saved Themes */}
            {savedThemes.length > 0 && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">Saved Themes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {savedThemes.map((theme: any) => (
                            <div key={theme.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                                <div
                                    className="w-10 h-10 rounded-full border-2 border-gray-300"
                                    style={{ backgroundColor: theme.baseColor }}
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{theme.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(theme.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => loadTheme(theme.id)}
                                    >
                                        Load
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteTheme(theme.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

export default CustomColorBuilder;
