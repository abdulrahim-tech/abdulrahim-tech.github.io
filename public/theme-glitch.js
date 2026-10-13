
document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const body = document.body;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let glitchTimeout = null;

    function getCurrentTheme() {
        for (const element of [root, body]) {
            const theme = element.getAttribute("data-theme");

            if (theme === "light" || theme === "dark") {
                return theme;
            }

            for (const mode of ["light", "dark"]) {
                if (
                    element.classList.contains(mode) ||
                    element.classList.contains(`${mode}-mode`) ||
                    element.classList.contains(`theme-${mode}`)
                ) {
                    return mode;
                }
            }
        }

        return null;
    }

    let previousTheme = getCurrentTheme();

    function playThemeGlitch() {
        if (reducedMotion.matches) return;

        clearTimeout(glitchTimeout);

        root.classList.remove("theme-glitching");

        // Restart CSS animation
        void root.offsetWidth;

        root.classList.add("theme-glitching");

        glitchTimeout = setTimeout(() => {
            root.classList.remove("theme-glitching");
        }, 650);
    }

    const themeObserver = new MutationObserver(() => {
        const currentTheme = getCurrentTheme();

        if (
            currentTheme !== null &&
            currentTheme !== previousTheme
        ) {
            previousTheme = currentTheme;
            playThemeGlitch();
        }
    });

    const observerOptions = {
        attributes: true,
        attributeFilter: ["data-theme", "class"]
    };

    themeObserver.observe(root, observerOptions);
    themeObserver.observe(body, observerOptions);
});
