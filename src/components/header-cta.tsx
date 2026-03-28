"use client";

export function HeaderCta() {
  return (
    <a
      className="button button-primary button-small header-cta"
      href="#hero-input"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("hero-input")?.scrollIntoView({ behavior: "smooth" });
        document.getElementById("hero-input")?.focus();
      }}
    >
      Check a Listing — Free
    </a>
  );
}
