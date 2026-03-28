"use client";

export function HeaderCta() {
  return (
    <a
      className="button button-primary button-small header-cta"
      href="/#hero-input"
      onClick={(e) => {
        const heroInput = document.getElementById("hero-input");

        if (!heroInput || window.location.pathname !== "/") {
          return;
        }

        e.preventDefault();
        heroInput.scrollIntoView({ behavior: "smooth", block: "center" });
        heroInput.focus();
      }}
    >
      Run Free Check
    </a>
  );
}
