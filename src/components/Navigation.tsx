import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, X, ArrowUpRight } from "lucide-react";
import { SearchOverlay } from "./SearchOverlay";
import logoUrl from "../assets/images/bitlance_logo.png";

export function Navigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { label: "Guides", path: "/category/guides" },
    { label: "Tutorials", path: "/category/tutorials" },
    { label: "Security", path: "/category/security" },
    { label: "Stories", path: "/category/success-stories" },
    { label: "Product", path: "/category/product" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#FAF6EF]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-18">
          {/* Brand Logo */}
          <div className="flex items-center gap-8 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0 focus-visible:ring-2 focus-visible:ring-[#F2861D] rounded-xl p-1 -m-1"
              aria-label="Bitlance Homepage"
            >
              <img
                src={logoUrl}
                alt="Bitlance"
                className="h-8.5 w-8.5 sm:h-9 sm:w-9 object-contain transition-transform duration-200 group-hover:scale-105 shrink-0"
              />
              <span className="hidden sm:inline-block text-xl font-bold tracking-tight text-[#1A1A1A] transition-colors group-hover:text-[#F2861D]">
                Bitlance
              </span>
            </Link>

            {/* Editorial Nav Links */}
            <nav
              className="hidden lg:flex items-center gap-1 text-sm font-semibold text-[#1A1A1A]"
              aria-label="Main Navigation"
            >
              <Link
                to="/"
                className={`flex items-center min-h-[40px] px-3.5 rounded-xl transition-all cursor-pointer select-none whitespace-nowrap ${
                  location.pathname === "/"
                    ? "text-[#F2861D] bg-[#F2861D]/10"
                    : "text-[#1A1A1A] hover:bg-black/5 hover:text-[#F2861D]"
                }`}
              >
                All Posts
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center min-h-[40px] px-3.5 rounded-xl transition-all cursor-pointer select-none whitespace-nowrap ${
                    location.pathname === link.path
                      ? "text-[#F2861D] bg-[#F2861D]/10"
                      : "text-[#1A1A1A] hover:bg-black/5 hover:text-[#F2861D]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Utility Bar: Search & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search articles and resources"
              className="flex items-center gap-2 min-h-[38px] px-3.5 rounded-xl bg-black/[0.04] hover:bg-black/[0.07] text-xs text-[#6B6B6B] hover:text-[#1A1A1A] transition-all active:scale-97 cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2861D]"
            >
              <Search className="h-3.5 w-3.5 text-[#6B6B6B] shrink-0" />
              <span className="font-medium text-xs text-[#1A1A1A]">
                Search
              </span>
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden flex items-center justify-center min-h-[38px] min-w-[38px] rounded-xl bg-black/[0.04] hover:bg-black/[0.07] text-[#1A1A1A] transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2861D]"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-[#1A1A1A]" />
              ) : (
                <Menu className="h-5 w-5 text-[#1A1A1A]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF6EF] shadow-2xl animate-fade-in">
            <div className="px-5 py-6 space-y-1.5">
              <Link
                to="/"
                className={`flex items-center min-h-[44px] px-4 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === "/"
                    ? "text-[#F2861D] bg-[#F2861D]/10"
                    : "text-[#1A1A1A] hover:bg-black/5"
                }`}
              >
                All Posts
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center min-h-[44px] px-4 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === link.path
                      ? "text-[#F2861D] bg-[#F2861D]/10"
                      : "text-[#1A1A1A] hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 mt-3">
                <a
                  href="https://bitlance.work"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between min-h-[44px] px-4 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-sm font-semibold active:scale-98 transition-all shadow-xs"
                >
                  <span>Visit bitlance.work</span>
                  <ArrowUpRight className="w-4 h-4 text-[#F2861D] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Overlay (Command+K) */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
