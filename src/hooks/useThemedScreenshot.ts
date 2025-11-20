import { useEffect, useState } from "react";

/**
 * Custom hook to get the correct screenshot path based on the current theme
 * Automatically appends "-dark" to the filename in dark mode
 * 
 * @param lightPath - Path to the light mode screenshot (e.g., "/screenshots/1.webp")
 * @returns The themed screenshot path (e.g., "/screenshots/1-dark.webp" in dark mode)
 */
export function useThemedScreenshot(lightPath: string): string {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme?.includes('dark') || theme === 'mahlzait-dark' || false);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // If dark mode and the path doesn't already include "-dark", insert it before the extension
  if (isDark && !lightPath.includes('-dark')) {
    const lastDotIndex = lightPath.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return lightPath.slice(0, lastDotIndex) + '-dark' + lightPath.slice(lastDotIndex);
    }
  }

  return lightPath;
}

