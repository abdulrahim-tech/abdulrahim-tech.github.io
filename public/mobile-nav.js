
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const nav = navbar.querySelector("nav");
    if (!nav || navbar.querySelector(".mobile-menu-toggle")) return;

    const menuButton = document.createElement("button");

    menuButton.type = "button";
    menuButton.className = "mobile-menu-toggle";
    menuButton.setAttribute("aria-label", "Open menu");
    menuButton.setAttribute("aria-expanded", "false");

    if (!nav.id) {
        nav.id = "primary-navigation";
    }

    menuButton.setAttribute("aria-controls", nav.id);

    menuButton.innerHTML = `
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
    `;

    navbar.insertBefore(menuButton, nav);
    navbar.classList.add("mobile-menu-ready");

    function closeMenu(returnFocus = false) {
        navbar.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");

        if (returnFocus) {
            menuButton.focus();
        }
    }

    menuButton.addEventListener("click", () => {
        const isOpen = navbar.classList.toggle("is-open");

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
    });

    nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            closeMenu();
        }
    });

    document.addEventListener("click", (event) => {
        if (!navbar.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            navbar.classList.contains("is-open")
        ) {
            closeMenu(true);
        }
    });

    const desktopView = window.matchMedia(
        "(min-width: 768px)"
    );

    desktopView.addEventListener("change", (event) => {
        if (event.matches) {
            closeMenu();
        }
    });
});
