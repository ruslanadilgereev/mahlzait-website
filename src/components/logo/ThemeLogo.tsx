import { useEffect, useState } from "react";

interface ThemeLogoProps {
  className?: string;
  alt?: string;
}

function ThemeLogo({ className = "h-7", alt = "Mahlzait Logo" }: ThemeLogoProps) {
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

  return (
    <img
      src={isDark ? "/logo-white.svg" : "/logo-black.svg"}
      alt={alt}
      className={className}
    />
  );
}

export default ThemeLogo;

