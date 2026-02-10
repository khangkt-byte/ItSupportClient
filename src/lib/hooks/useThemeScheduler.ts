import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from './useTheme';

/**
 * Hook for managing dark mode scheduling
 * 
 * Features:
 * - Time-based dark mode switching
 * - Sunset/sunrise-based switching
 * - Manual schedule override
 * - Persist schedule to localStorage
 * - Real-time monitoring with intervals
 * - Graceful fallback handling
 * 
 * @returns Theme scheduler utilities
 */
export type ScheduleMode = 'disabled' | 'time-based' | 'sunset-sunrise';

export interface TimeSchedule {
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
}

export interface SunsetSchedule {
    latitude: number;
    longitude: number;
    locationName?: string;
}

export interface ScheduleState {
    mode: ScheduleMode;
    timeSchedule?: TimeSchedule;
    sunsetSchedule?: SunsetSchedule;
}

export function useThemeScheduler() {
    const { theme, changeTheme } = useTheme();
    const [schedule, setSchedule] = useState<ScheduleState>({
        mode: 'disabled',
    });
    const [isDarkModeActive, setIsDarkModeActive] = useState(false);
    const [nextChangeAt, setNextChangeAt] = useState<Date | null>(null);
    const [sunriseTime, setSunriseTime] = useState<string | null>(null);
    const [sunsetTime, setSunsetTime] = useState<string | null>(null);

    // Load schedule from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('theme-schedule');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSchedule(parsed);
            } catch (e) {
                console.error('Failed to load schedule', e);
            }
        }
    }, []);

    /**
     * Get current time as HH:MM string
     */
    const getCurrentTimeString = useCallback(() => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }, []);

    /**
     * Compare time strings (HH:MM format)
     * Returns: -1 if time1 < time2, 0 if equal, 1 if time1 > time2
     */
    const compareTime = useCallback((time1: string, time2: string): number => {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);

        const t1 = h1 * 60 + m1;
        const t2 = h2 * 60 + m2;

        return t1 < t2 ? -1 : t1 > t2 ? 1 : 0;
    }, []);

    /**
     * Check if current time is within schedule (time-based)
     */
    const isWithinTimeSchedule = useCallback((): boolean => {
        if (schedule.mode !== 'time-based' || !schedule.timeSchedule) {
            return false;
        }

        const now = getCurrentTimeString();
        const { startTime, endTime } = schedule.timeSchedule;

        // Handle overnight schedule (e.g., 18:00 to 07:00)
        if (compareTime(startTime, endTime) > 0) {
            // Schedule spans midnight
            return compareTime(now, startTime) >= 0 || compareTime(now, endTime) < 0;
        } else {
            // Normal daytime schedule
            return compareTime(now, startTime) >= 0 && compareTime(now, endTime) < 0;
        }
    }, [schedule, getCurrentTimeString, compareTime]);

    /**
     * Calculate sunrise/sunset times using simple algorithm
     * Based on latitude and date
     */
    const calculateSunsetSunrise = useCallback(
        (latitude: number, longitude: number): { sunrise: string; sunset: string } => {
            const now = new Date();
            const jan1 = new Date(now.getFullYear(), 0, 1);
            const dayOfYear = Math.floor((now.getTime() - jan1.getTime()) / 86400000) + 1;

            // Simplified calculation (not accurate for all locations)
            const latRad = (latitude * Math.PI) / 180;
            const lonRad = (longitude * Math.PI) / 180;

            // Equation of time
            const b = (360 / 365) * (dayOfYear - 1);
            const eot = 229.18 * (0.000075 + 0.001868 * Math.cos((b * Math.PI) / 180) - 0.032077 * Math.sin((b * Math.PI) / 180));

            // Declination
            const decRad = Math.asin(Math.sin((b * Math.PI) / 180) * Math.sin((23.44 * Math.PI) / 180));

            // Hour angle
            const cosH = -Math.tan(latRad) * Math.tan(decRad);
            const valueH = Math.acos(Math.max(-1, Math.min(1, cosH)));
            const h = (valueH * 180) / Math.PI / 15;

            // Sunrise and sunset
            const utSunrise = 12 - h - eot / 60 - longitude / 15;
            const utSunset = 12 + h - eot / 60 - longitude / 15;

            const formatTime = (ut: number): string => {
                const hours = Math.floor((ut + 24) % 24);
                const minutes = Math.floor(((ut + 24) % 24 - hours) * 60);
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            };

            return {
                sunrise: formatTime(utSunrise),
                sunset: formatTime(utSunset),
            };
        },
        []
    );

    /**
     * Check if current time is within sunset schedule
     */
    const isWithinSunsetSchedule = useCallback((): boolean => {
        if (schedule.mode !== 'sunset-sunrise' || !schedule.sunsetSchedule) {
            return false;
        }

        const { latitude, longitude } = schedule.sunsetSchedule;
        const { sunrise, sunset } = calculateSunsetSunrise(latitude, longitude);

        setSunriseTime(sunrise);
        setSunsetTime(sunset);

        const now = getCurrentTimeString();

        // Dark mode from sunset to sunrise
        if (compareTime(sunset, sunrise) > 0) {
            // Sunset is after sunrise (normal case across midnight)
            return compareTime(now, sunset) >= 0 || compareTime(now, sunrise) < 0;
        } else {
            // Sunset before sunrise (shouldn't happen, but handle it)
            return compareTime(now, sunset) >= 0 && compareTime(now, sunrise) < 0;
        }
    }, [schedule, calculateSunsetSunrise, getCurrentTimeString, compareTime]);

    /**
     * Calculate next theme change time
     */
    const calculateNextChange = useCallback((): Date | null => {
        if (schedule.mode === 'disabled') return null;

        const now = new Date();

        if (schedule.mode === 'time-based' && schedule.timeSchedule) {
            const getNextTime = (timeStr: string): Date => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                const nextTime = new Date(now);
                nextTime.setHours(hours, minutes, 0, 0);

                if (nextTime <= now) {
                    nextTime.setDate(nextTime.getDate() + 1);
                }

                return nextTime;
            };

            const { startTime, endTime } = schedule.timeSchedule;
            const startDate = getNextTime(startTime);
            const endDate = getNextTime(endTime);

            if (isDarkModeActive) {
                return endDate;
            } else {
                return startDate;
            }
        }

        if (schedule.mode === 'sunset-sunrise' && schedule.sunsetSchedule) {
            const { latitude, longitude } = schedule.sunsetSchedule;
            const { sunrise, sunset } = calculateSunsetSunrise(latitude, longitude);

            const getNextTime = (timeStr: string): Date => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                const nextTime = new Date(now);
                nextTime.setHours(hours, minutes, 0, 0);

                if (nextTime <= now) {
                    nextTime.setDate(nextTime.getDate() + 1);
                }

                return nextTime;
            };

            const sunsetDate = getNextTime(sunset);
            const sunriseDate = getNextTime(sunrise);

            if (isDarkModeActive) {
                return sunriseDate;
            } else {
                return sunsetDate;
            }
        }

        return null;
    }, [schedule, isDarkModeActive, calculateSunsetSunrise]);

    /**
     * Update dark mode status based on current schedule
     */
    useEffect(() => {
        let shouldBeDark = false;

        if (schedule.mode === 'time-based') {
            shouldBeDark = isWithinTimeSchedule();
        } else if (schedule.mode === 'sunset-sunrise') {
            shouldBeDark = isWithinSunsetSchedule();
        }

        setIsDarkModeActive(shouldBeDark);

        // Apply theme if it changed
        if (shouldBeDark && theme !== 'dark') {
            changeTheme('dark');
        } else if (!shouldBeDark && theme !== 'light') {
            changeTheme('light');
        }

        // Update next change time
        setNextChangeAt(calculateNextChange());
    }, [schedule, isWithinTimeSchedule, isWithinSunsetSchedule, theme, changeTheme, calculateNextChange]);

    /**
     * Set up interval to check schedule every minute
     */
    useEffect(() => {
        if (schedule.mode === 'disabled') return;

        const interval = setInterval(() => {
            // Recalculate every minute
            let shouldBeDark = false;

            if (schedule.mode === 'time-based') {
                shouldBeDark = isWithinTimeSchedule();
            } else if (schedule.mode === 'sunset-sunrise') {
                shouldBeDark = isWithinSunsetSchedule();
            }

            if (shouldBeDark !== isDarkModeActive) {
                setIsDarkModeActive(shouldBeDark);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [schedule, isDarkModeActive, isWithinTimeSchedule, isWithinSunsetSchedule]);

    /**
     * Enable time-based scheduling
     */
    const setTimeSchedule = useCallback((startTime: string, endTime: string) => {
        const newSchedule: ScheduleState = {
            mode: 'time-based',
            timeSchedule: { startTime, endTime },
        };
        setSchedule(newSchedule);
        localStorage.setItem('theme-schedule', JSON.stringify(newSchedule));
    }, []);

    /**
     * Enable sunset-based scheduling
     */
    const setSunsetRiseSchedule = useCallback((latitude: number, longitude: number, locationName?: string) => {
        const newSchedule: ScheduleState = {
            mode: 'sunset-sunrise',
            sunsetSchedule: { latitude, longitude, locationName },
        };
        setSchedule(newSchedule);
        localStorage.setItem('theme-schedule', JSON.stringify(newSchedule));
    }, []);

    /**
     * Disable scheduling
     */
    const disableScheduling = useCallback(() => {
        const newSchedule: ScheduleState = { mode: 'disabled' };
        setSchedule(newSchedule);
        localStorage.setItem('theme-schedule', JSON.stringify(newSchedule));
    }, []);

    /**
     * Get status description
     */
    const getStatusDescription = useCallback((): string => {
        if (schedule.mode === 'disabled') {
            return 'Scheduling disabled';
        }

        if (schedule.mode === 'time-based' && schedule.timeSchedule) {
            const { startTime, endTime } = schedule.timeSchedule;
            return `Dark mode from ${startTime} to ${endTime}`;
        }

        if (schedule.mode === 'sunset-sunrise' && schedule.sunsetSchedule) {
            return `Dark mode from sunset to sunrise at ${schedule.sunsetSchedule.locationName || 'current location'}`;
        }

        return 'Unknown schedule';
    }, [schedule]);

    return {
        // State
        schedule,
        isDarkModeActive,
        nextChangeAt,
        sunriseTime,
        sunsetTime,

        // Actions
        setTimeSchedule,
        setSunsetRiseSchedule,
        disableScheduling,

        // Utilities
        getStatusDescription,
        getCurrentTimeString,
    };
}

export type UseThemeSchedulerReturn = ReturnType<typeof useThemeScheduler>;
