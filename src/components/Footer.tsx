import { useState } from "react";
import { Link } from "react-router-dom";
import { Github, Send, Check, Loader2, ArrowRight, ArrowUpRight } from "lucide-react";
import logoUrl from "../assets/images/bitlance_logo.png";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }, 500);
  };

  return (
    <footer className="bg-[#2A1E14] text-[#EAE4D8] pt-14 pb-12 font-sans selection:bg-[#F2861D] selection:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 group w-fit focus-visible:ring-2 focus-visible:ring-[#F2861D] rounded-xl p-1 -m-1"
              aria-label="Bitlance Homepage"
            >
              <img
                src={logoUrl}
                alt="Bitlance Logo"
                className="h-8.5 w-8.5 sm:h-9 sm:w-9 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-white text-2xl tracking-tight">
                Bitlance
              </span>
            </Link>
            <p className="text-sm text-[#EAE4D8]/80 leading-relaxed font-normal max-w-sm">
              The simplest freelance platform for the Bitcoin economy. Insights, guides, and career playbooks for global remote talent.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://x.com/bitlancework"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 min-h-[36px] rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#EAE4D8] hover:text-white transition-all active:scale-95 cursor-pointer shadow-2xs"
                title="X (formerly Twitter)"
                aria-label="Follow Bitlance on X"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://github.com/bitlance1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 min-h-[36px] rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#EAE4D8] hover:text-white transition-all active:scale-95 cursor-pointer shadow-2xs"
                title="GitHub"
                aria-label="View Bitlance on GitHub"
              >
                <Github className="h-4 w-4" />
              </a>

              <a
                href="https://t.me/+ITw8yz1xJIhjNWE0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 min-h-[36px] rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#EAE4D8] hover:text-white transition-all active:scale-95 cursor-pointer shadow-2xs"
                title="Telegram"
                aria-label="Join Bitlance on Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column: Editorial Categories */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-sm tracking-tight">
              Publication
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-[#EAE4D8]/80">
              <li>
                <Link to="/category/guides" className="hover:text-white transition-colors block py-0.5">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/category/tutorials" className="hover:text-white transition-colors block py-0.5">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link to="/category/security" className="hover:text-white transition-colors block py-0.5">
                  Security & Protection
                </Link>
              </li>
              <li>
                <Link to="/category/success-stories" className="hover:text-white transition-colors block py-0.5">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/category/product" className="hover:text-white transition-colors block py-0.5">
                  Product Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Platform & Help */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-sm tracking-tight">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-[#EAE4D8]/80">
              <li>
                <a
                  href="https://bitlance.work"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group py-0.5"
                >
                  <span>bitlance.work</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#F2861D] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://bitlance.work/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group py-0.5"
                >
                  <span>Help Center</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#EAE4D8]/50 group-hover:text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://bitlance.work/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group py-0.5"
                >
                  <span>Privacy Policy</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#EAE4D8]/50 group-hover:text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://bitlance.work/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group py-0.5"
                >
                  <span>Terms of Service</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#EAE4D8]/50 group-hover:text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Newsletter Signup */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-sm tracking-tight">
              Newsletter
            </h4>
            <p className="text-xs text-[#EAE4D8]/80 leading-relaxed font-normal">
              Get our weekly Bitcoin career digest and curated remote opportunities.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-[#16A34A] bg-white/10 px-3.5 py-2.5 rounded-xl text-xs font-semibold animate-fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>Subscribed! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-black/40 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F2861D] placeholder-gray-400 text-white font-medium shadow-inner min-h-[40px]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F2861D] hover:bg-[#D9740F] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px] active:scale-97 select-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Copyright and Sign-Off */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#EAE4D8]/60 font-normal">
          <div>
            © 2026 Bitlance. Built for the Bitcoin economy.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-white transition-colors">
              Blog Home
            </Link>
            <span>·</span>
            <a
              href="https://bitlance.work"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1 group"
            >
              <span>Main App</span>
              <ArrowUpRight className="w-3 h-3 text-[#EAE4D8]/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
