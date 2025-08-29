import { Toaster as SonnerPrimitive, toast as sonnerToast } from "sonner";
import { useEffect, useState } from "react";

type ToasterProps = React.ComponentProps<typeof SonnerPrimitive>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // This logic ensures the toast theme matches your app's theme
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Set initial theme
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

    return () => observer.disconnect();
  }, []);

  return (
    <SonnerPrimitive
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// Export the toast function directly from here
export { Toaster, sonnerToast as toast };