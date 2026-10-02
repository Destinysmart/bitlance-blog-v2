import React, { useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, Users, LogOut, Menu, X, Image as ImageIcon } from "lucide-react";
import { MediaLibraryModal } from "../../components/MediaLibraryModal";

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
      isActive
        ? "bg-[#F2861D]/15 text-[#F2861D]"
        : "text-[#EAE4D8] hover:bg-white/5 hover:text-white"
    }`;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-[#FAF6EF] flex-col md:flex-row overflow-hidden font-sans selection:bg-[#F2861D] selection:text-white">
      {/* Mobile Header Bar */}
      <header className="flex md:hidden items-center justify-between px-4 h-16 bg-[#2A1E14] border-b border-[#3D2E22] z-50 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#F2861D] flex items-center justify-center text-white font-bold text-sm shadow-xs">₿</div>
          <span className="font-bold text-white tracking-tight text-lg">Bitlance CMS</span>
        </Link>
        <button
          onClick={toggleMobileMenu}
          className="p-2 text-[#EAE4D8] hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
          aria-label="Toggle admin navigation menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-[#2A1E14] border-b border-[#3D2E22] shadow-lg z-40 animate-fade-in flex flex-col p-4 gap-2">
          <NavLink to="/admin" end onClick={() => setIsMobileMenuOpen(false)} className={navClass}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/articles" onClick={() => setIsMobileMenuOpen(false)} className={navClass}>
            <FileText className="h-5 w-5" />
            Articles
          </NavLink>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsMediaLibraryOpen(true);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 text-[#EAE4D8] hover:bg-white/5 hover:text-white cursor-pointer w-full text-left"
          >
            <ImageIcon className="h-5 w-5" />
            Media Library
          </button>
          <NavLink to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className={navClass}>
            <Users className="h-5 w-5" />
            Users
          </NavLink>
          <NavLink to="/admin/settings" onClick={() => setIsMobileMenuOpen(false)} className={navClass}>
            <Settings className="h-5 w-5" />
            Settings
          </NavLink>
          <div className="border-t border-[#3D2E22] mt-2 pt-2">
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-[#9CA3AF] hover:text-white font-semibold text-sm transition-colors">
              <LogOut className="h-5 w-5" />
              Exit to Site
            </Link>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#2A1E14] border-r border-[#3D2E22] flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-[#3D2E22] flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#F2861D] flex items-center justify-center text-white font-bold text-sm shadow-xs">₿</div>
          <span className="font-bold text-white tracking-tight text-lg">Bitlance CMS</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/admin" end className={navClass}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/articles" className={navClass}>
            <FileText className="h-5 w-5" />
            Articles
          </NavLink>
          <button
            onClick={() => setIsMediaLibraryOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 text-[#EAE4D8] hover:bg-white/5 hover:text-white cursor-pointer w-full text-left"
          >
            <ImageIcon className="h-5 w-5" />
            Media Library
          </button>
          <NavLink to="/admin/users" className={navClass}>
            <Users className="h-5 w-5" />
            Users
          </NavLink>
          <NavLink to="/admin/settings" className={navClass}>
            <Settings className="h-5 w-5" />
            Settings
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-[#3D2E22]">
           <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-[#9CA3AF] hover:text-white font-semibold text-sm transition-colors hover:bg-white/5 rounded-xl">
             <LogOut className="h-5 w-5" />
             Exit to Site
           </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full min-w-0">
        <Outlet />
      </main>

      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={() => setIsMediaLibraryOpen(false)}
        title="Centralized Media Library Manager"
      />
    </div>
  );
}
