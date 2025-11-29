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

    // -------- Interactive gallery features --------
    const filterButtons = document.querySelectorAll(".category-btn");
    const gallerySections = document.querySelectorAll(".gallery-section");
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.querySelector(".gallery-lightbox");
    const lightboxImage = lightbox?.querySelector(".gallery-lightbox__img");
    const lightboxCaption = lightbox?.querySelector(".gallery-lightbox__caption");
    const lightboxPrev = lightbox?.querySelector("[data-lightbox-prev]");
    const lightboxNext = lightbox?.querySelector("[data-lightbox-next]");

    let lightboxItems = [];
    let lightboxIndex = -1;

    const closeSection = section => {
        const panel = section.querySelector(".section-content");
        section.classList.remove("open");
        if (panel) {
            panel.style.maxHeight = "0px";
        }
    };

    const openSection = section => {
        const panel = section.querySelector(".section-content");
        section.classList.add("open");
        if (panel) {
            panel.style.maxHeight = `${panel.scrollHeight}px`;
        }
    };

    const closeAllSections = () => {
        gallerySections.forEach(closeSection);
    };

    const ensureOpenSection = () => {
        const visibleSection = Array.from(gallerySections).find(
            section => !section.classList.contains("hidden")
        );
        const currentlyOpen = document.querySelector(".gallery-section.open:not(.hidden)");
        if (!currentlyOpen && visibleSection) {
            openSection(visibleSection);
        }
    };

    const updateSectionVisibility = () => {
        gallerySections.forEach(section => {
            const hasVisibleItem = Array.from(section.querySelectorAll("figure")).some(
                figure => !figure.classList.contains("hidden")
            );
            section.classList.toggle("hidden", !hasVisibleItem);
            if (!hasVisibleItem) {
                closeSection(section);
            }
        });
        ensureOpenSection();
    };

    const applyFilter = filterValue => {
        galleryItems.forEach(item => {
            const itemFigure = item.closest("figure");
            if (!itemFigure) {
                return;
            }
            const categories =
                item.dataset.category
                    ?.split(/\s+/)
                    .map(value => value.trim())
                    .filter(Boolean) ?? [];
            const matches = filterValue === "all" || categories.includes(filterValue);
            itemFigure.classList.toggle("hidden", !matches);
        });
        updateSectionVisibility();
    };

    if (filterButtons.length) {
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                const filterValue = button.dataset.filter ?? "all";
                filterButtons.forEach(btn => btn.classList.toggle("active", btn === button));
                applyFilter(filterValue);
            });
        });
    }

    const getVisibleGalleryItems = () =>
        Array.from(galleryItems).filter(
            item => !item.closest("figure")?.classList.contains("hidden")
        );

    const showLightboxItem = index => {
        if (!lightbox || !lightboxImage || !lightboxItems.length) {
            return;
        }
        const normalizedIndex = (index + lightboxItems.length) % lightboxItems.length;
        lightboxIndex = normalizedIndex;
        const img = lightboxItems[normalizedIndex];
        const fullSrc = img.dataset.full || img.src;
        const captionText =
            img.closest("figure")?.querySelector("figcaption")?.textContent?.trim() ?? "";

        lightboxImage.src = fullSrc ?? "";
        lightboxImage.alt = img.alt ?? captionText;
        if (lightboxCaption) {
            lightboxCaption.textContent = captionText;
        }
    };

    const openLightbox = img => {
        if (!lightbox || !lightboxImage) {
            return;
        }
        lightboxItems = getVisibleGalleryItems();
        if (!lightboxItems.length) {
            lightboxItems = Array.from(galleryItems);
        }
        let index = lightboxItems.indexOf(img);
        if (index === -1) {
            index = 0;
        }
        showLightboxItem(index);
        lightbox.classList.remove("hidden");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
    };

    const closeLightbox = () => {
        if (!lightbox || !lightboxImage) {
            return;
        }
        lightbox.classList.add("hidden");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.src = "";
        document.body.classList.remove("lightbox-open");
        lightboxItems = [];
        lightboxIndex = -1;
    };

    if (galleryItems.length) {
        galleryItems.forEach(item => {
            item.setAttribute("tabindex", "0");
            item.addEventListener("click", () => openLightbox(item));
            item.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox(item);
                }
            });
        });
    }

    lightbox?.addEventListener("click", event => {
        if (
            event.target.dataset.lightboxClose !== undefined ||
            event.target.classList.contains("gallery-lightbox__overlay")
        ) {
            closeLightbox();
        }
    });

    lightboxPrev?.addEventListener("click", event => {
        event.stopPropagation();
        if (lightboxItems.length) {
            showLightboxItem(lightboxIndex - 1);
        }
    });

    lightboxNext?.addEventListener("click", event => {
        event.stopPropagation();
        if (lightboxItems.length) {
            showLightboxItem(lightboxIndex + 1);
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeLightbox();
        }
        if (lightbox && !lightbox.classList.contains("hidden")) {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showLightboxItem(lightboxIndex - 1);
            }
            if (event.key === "ArrowRight") {
                event.preventDefault();
                showLightboxItem(lightboxIndex + 1);
            }
        }
    });

    const accordionHeaders = document.querySelectorAll(".gallery-section .section-header");
    if (accordionHeaders.length) {
        accordionHeaders.forEach(header => {
            const section = header.closest(".gallery-section");
            if (!section) {
                return;
            }
            header.addEventListener("click", () => {
                const isOpen = section.classList.contains("open");
                closeAllSections();
                if (!isOpen) {
                    openSection(section);
                }
            });

            header.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    header.click();
                }
            });
        });
        closeAllSections();
        const firstSection = gallerySections[0];
        if (firstSection) {
            openSection(firstSection);
        }
    }

    // run once to ensure sections reflect any preselected filter
    updateSectionVisibility();
});
