// waiting till everything exists so I don't yell at nulls
document.addEventListener("DOMContentLoaded", () => {
    // auto-drop the current year in the footer since I will forget otherwise
    const yearTarget = document.getElementById("year");
    if (yearTarget) {
        yearTarget.textContent = new Date().getFullYear();
    }

    // highlight the nav item that matches whatever page the body says we are on
    const bodyPage = document.body?.dataset?.page;
    if (bodyPage) {
        document
            .querySelectorAll(`[data-page="${bodyPage}"]`)
            .forEach(link => link.classList.add("is-active"));
    }

    // tiny mobile menu toggle so the hamburger actually does something
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("primary-menu");

    toggle?.addEventListener("click", () => {
        const isOpen = menu?.classList.toggle("is-open");
        const expanded = Boolean(isOpen);
        toggle.setAttribute("aria-expanded", String(expanded));
        document.body.classList.toggle("nav-open", expanded);
    });

    menu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            if (menu.classList.contains("is-open")) {
                menu.classList.remove("is-open");
                toggle?.setAttribute("aria-expanded", "false");
                document.body.classList.remove("nav-open");
            }
        });
    });
});
