import React, { useState, useEffect } from 'react';
import {
    Clock,
    Sun,
    Moon,
    MapPin,
    Settings2,
    Check,
    AlertCircle,
} from 'lucide-react';
import { useThemeScheduler } from '@/features/theme/hooks/useThemeScheduler';
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
 * ThemeScheduler Component
 * 
 * Allows users to schedule automatic theme switching
 * Supports time-based and sunset/sunrise-based scheduling
 * 
 * Features:
 * - Time-based dark mode scheduling
 * - Sunset/sunrise-based scheduling
 * - Location-aware calculations
 * - Schedule preview with next change time
 * - Real-time status monitoring
 * - Quick enable/disable toggle
 * 
 * @component
 */
export function ThemeScheduler() {
    const {
        schedule,
        isDarkModeActive,
        nextChangeAt,
        sunriseTime,
        sunsetTime,
        setTimeSchedule,
        setSunsetRiseSchedule,
        disableScheduling,
        getStatusDescription,
        getCurrentTimeString,
    } = useThemeScheduler();

    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Time-based form state
    const [startTime, setStartTime] = useState('18:00');
    const [endTime, setEndTime] = useState('07:00');

    // Sunset-based form state
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState(51.5074);
    const [longitude, setLongitude] = useState(-0.1278);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Format time for display
    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get user location
    const getCurrentLocation = async () => {
        setIsLoadingLocation(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude: lat, longitude: lon } = position.coords;
            setLatitude(lat);
            setLongitude(lon);

            // Try to get location name from reverse geocoding
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
                );
                const data = await response.json();
                if (data.address?.city || data.address?.town) {
                    setLocation(data.address.city || data.address.town);
                }
            } catch (e) {
                console.warn('Failed to get location name', e);
            }
        } catch (error) {
            console.error('Failed to get location:', error);
            alert('Unable to get your location. Please check permissions.');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    // Initialize form with current schedule
    useEffect(() => {
        if (schedule.mode === 'time-based' && schedule.timeSchedule) {
            setStartTime(schedule.timeSchedule.startTime);
            setEndTime(schedule.timeSchedule.endTime);
        }
        if (schedule.mode === 'sunset-sunrise' && schedule.sunsetSchedule) {
            setLatitude(schedule.sunsetSchedule.latitude);
            setLongitude(schedule.sunsetSchedule.longitude);
            setLocation(schedule.sunsetSchedule.locationName || '');
        }
    }, [schedule, isOpen]);

    return (
        <div className="space-y-4">
            {/* Quick Status Card */}
            {schedule.mode !== 'disabled' && (
                <Card className={`p-4 ${isDarkModeActive ? 'bg-slate-800 border-slate-700 text-white' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isDarkModeActive ? (
                                <Moon className={`w-5 h-5 ${isDarkModeActive ? 'text-yellow-400' : 'text-gray-600'}`} />
                            ) : (
                                <Sun className="w-5 h-5 text-amber-500" />
                            )}
                            <div>
                                <p className="font-semibold text-sm">
                                    {isDarkModeActive ? 'Dark Mode' : 'Light Mode'} Active
                                </p>
                                <p className="text-xs opacity-80 mt-0.5">
                                    {getStatusDescription()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs opacity-75">Next Change:</p>
                            <p className="font-mono font-semibold text-sm">
                                {nextChangeAt ? formatTime(nextChangeAt) : '—'}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Settings Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        size="lg"
                    >
                        <Settings2 className="w-4 h-4" />
                        Schedule Configuration
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Theme Scheduler</DialogTitle>
                        <DialogDescription>
                            Automatically switch between light and dark themes
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue={schedule.mode === 'disabled' ? 'disabled' : schedule.mode} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="disabled">Disabled</TabsTrigger>
                            <TabsTrigger value="time-based">Time-Based</TabsTrigger>
                            <TabsTrigger value="sunset-sunrise">Sunset/Sunrise</TabsTrigger>
                        </TabsList>

                        {/* Disabled Tab */}
                        <TabsContent value="disabled" className="space-y-4">
                            <Card className="p-6">
                                <div className="text-center space-y-3">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
                                    <h3 className="font-semibold text-gray-900">Scheduling Disabled</h3>
                                    <p className="text-sm text-gray-600">
                                        Choose a scheduling mode to enable automatic theme switching
                                    </p>
                                </div>
                            </Card>
                        </TabsContent>

                        {/* Time-Based Tab */}
                        <TabsContent value="time-based" className="space-y-4">
                            <Card className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-3">
                                        <Clock className="w-4 h-4 inline mr-2" />
                                        Schedule Times
                                    </label>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-2">
                                                Dark Mode Start Time
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="time"
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Moon className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Dark mode will activate at this time
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-2">
                                                Dark Mode End Time
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="time"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Sun className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Light mode will activate at this time
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule Preview */}
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                        Schedule Preview
                                    </p>
                                    <p className="text-sm text-gray-700 font-mono">
                                        Dark mode: <span className="font-bold">{startTime}</span> to{' '}
                                        <span className="font-bold">{endTime}</span>
                                    </p>
                                    <p className="text-xs text-gray-600 mt-2">
                                        Current time: <span className="font-semibold">{getCurrentTimeString()}</span>
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        onClick={() => {
                                            setTimeSchedule(startTime, endTime);
                                            setIsOpen(false);
                                        }}
                                        className="flex-1 gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Enable Time Schedule
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            disableScheduling();
                                            setIsOpen(false);
                                        }}
                                    >
                                        Disable
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>

                        {/* Sunset/Sunrise Tab */}
                        <TabsContent value="sunset-sunrise" className="space-y-4">
                            <Card className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-3">
                                        <MapPin className="w-4 h-4 inline mr-2" />
                                        Location Settings
                                    </label>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-2">
                                                Location Name
                                            </label>
                                            <Input
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="E.g., London, New York..."
                                                className="w-full"
                                            />
                                        </div>

                                        <Button
                                            onClick={getCurrentLocation}
                                            disabled={isLoadingLocation}
                                            variant="outline"
                                            className="w-full gap-2"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            {isLoadingLocation ? 'Getting location...' : 'Use Current Location'}
                                        </Button>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                                    Latitude
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.0001"
                                                    value={latitude}
                                                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                                                    placeholder="51.5074"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                                    Longitude
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.0001"
                                                    value={longitude}
                                                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                                                    placeholder="-0.1278"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sunrise/Sunset Preview */}
                                {sunriseTime && sunsetTime && (
                                    <div className="p-4 bg-linear-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-200">
                                        <p className="text-xs font-semibold text-gray-700 uppercase mb-3">
                                            Today's Times
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-gray-700">
                                                    <Sun className="w-4 h-4 text-amber-500" />
                                                    Sunrise
                                                </span>
                                                <span className="font-mono font-semibold">{sunriseTime}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-gray-700">
                                                    <Moon className="w-4 h-4 text-blue-600" />
                                                    Sunset
                                                </span>
                                                <span className="font-mono font-semibold">{sunsetTime}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-3">
                                            Dark mode will be active from sunset to sunrise
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        onClick={() => {
                                            setSunsetRiseSchedule(latitude, longitude, location);
                                            setIsOpen(false);
                                        }}
                                        className="flex-1 gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Enable Sunset Schedule
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            disableScheduling();
                                            setIsOpen(false);
                                        }}
                                    >
                                        Disable
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Info Footer */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-900">
                            <span className="font-semibold">💡 Tip:</span> Your schedule is automatically saved.
                            The app will switch themes at the scheduled times, even when you're not using it.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ThemeScheduler;
