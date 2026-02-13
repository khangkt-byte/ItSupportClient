import { test, expect } from '@playwright/test';

const getCssVar = async (page: { evaluate: Function }, name: string) => {
    return page.evaluate((varName: string) => {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim();
    }, name);
};

test('switches semantic tokens by appearance and keeps brand palette', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('appearance', 'light');
        localStorage.setItem('brandColor', 'brand-purple');
        localStorage.setItem('a11y', 'default');
    });

    await page.goto('/');
    await page.waitForFunction(() => {
        return document.documentElement.getAttribute('data-appearance') === 'light';
    });

    const lightSuccess = await getCssVar(page, '--color-success');
    const lightPrimary = await getCssVar(page, '--color-primary-500');

    expect(lightSuccess).not.toBe('');
    expect(lightPrimary).not.toBe('');

    await page.evaluate(() => {
        localStorage.setItem('appearance', 'dark');
        localStorage.setItem('brandColor', 'brand-purple');
        localStorage.setItem('a11y', 'default');
    });

    await page.reload();
    await page.waitForFunction(() => {
        return document.documentElement.getAttribute('data-appearance') === 'dark';
    });

    const darkSuccess = await getCssVar(page, '--color-success');
    const darkPrimary = await getCssVar(page, '--color-primary-500');

    expect(darkSuccess).not.toBe('');
    expect(darkSuccess).not.toBe(lightSuccess);
    expect(darkPrimary).toBe(lightPrimary);

    await page.evaluate(() => {
        localStorage.setItem('brandColor', 'brand-red');
    });

    await page.reload();
    await page.waitForFunction(() => {
        return document.documentElement.getAttribute('data-brand') === 'brand-red';
    });

    const redPrimary = await getCssVar(page, '--color-primary-500');
    expect(redPrimary).not.toBe('');
    expect(redPrimary).not.toBe(lightPrimary);
});
