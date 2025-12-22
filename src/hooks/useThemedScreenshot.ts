import { useEffect, useState } from "react";

/**
 * Custom hook to get the correct screenshot path based on the current theme
 * Automatically appends "-dark" to the filename in dark mode
 * Uses optimized images from /screenshots/optimized/ for better performance
 * 
 * @param lightPath - Path to the light mode screenshot (e.g., "/screenshots/1.webp")
 * @returns The themed screenshot path (e.g., "/screenshots/optimized/1-dark.webp" in dark mode)
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

  // Use optimized folder for screenshots
  let path = lightPath;
  if (path.startsWith('/screenshots/') && !path.includes('/optimized/')) {
    path = path.replace('/screenshots/', '/screenshots/optimized/');
  }

  // If dark mode and the path doesn't already include "-dark", insert it before the extension
  if (isDark && !path.includes('-dark')) {
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return path.slice(0, lastDotIndex) + '-dark' + path.slice(lastDotIndex);
    }
  }

  return path;
}

