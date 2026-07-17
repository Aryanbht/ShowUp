import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "text-white transition-colors"
      : "text-gray-400 hover:text-white transition-colors";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-md border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 outline-none">
            <svg viewBox="0 0 24 24" fill="#8b5cf6" width="24" height="24" aria-label="ShowUp Logo" role="img">
              <path d="M5 8v6a7 7 0 0 0 14 0v-3h-3.5v3a3.5 3.5 0 0 1-7 0V8H5z" />
              <path d="M17.25 2l-5 5h3.25v2h3.5V7h3.25L17.25 2z" />
            </svg>
            <span className="font-bold text-lg tracking-tight text-white">ShowUp</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className={getLinkClass("/")}>Home</Link>
            <Link to="/product" className={getLinkClass("/product")}>Product</Link>
            <Link to="/solutions" className={getLinkClass("/solutions")}>Solutions</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/auth" className="flex items-center justify-center text-xs font-medium bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#3a3a3a] text-white px-3 py-1.5 rounded-md transition-colors">
            Sign in
          </Link>
          <Link to="/auth" className="hidden sm:flex items-center justify-center text-xs font-medium bg-[#8b5cf6] hover:bg-[#7c3aed] border border-[#8b5cf6] text-black px-3 py-1.5 rounded-md transition-colors">
            Start your project
          </Link>
          <button 
            className="lg:hidden ml-2 text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#2a2a2a] bg-[#000000] px-6 py-4 flex flex-col gap-4">
          <Link to="/" className={getLinkClass("/")}>Home</Link>
          <Link to="/product" className={getLinkClass("/product")}>Product</Link>
          <Link to="/solutions" className={getLinkClass("/solutions")}>Solutions</Link>
          
          <Link to="/auth" className="sm:hidden mt-2 flex items-center justify-center text-sm font-medium bg-[#8b5cf6] hover:bg-[#7c3aed] border border-[#8b5cf6] text-black px-4 py-2 rounded-md transition-colors">
            Start your project
          </Link>
        </div>
      )}
    </nav>
  );
}
