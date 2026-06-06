import React, { useState, useEffect } from 'react';
import { getCurrentApiUrl } from '../services/apiService';
import { signOut } from '../services/authService';

const Navbar = ({ activeSection, setActiveSection, currentUser, userData, onAuthClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    checkApiConfiguration();
  }, []);

  const checkApiConfiguration = async () => {
    const apiUrl = await getCurrentApiUrl();
    setApiConfigured(!!apiUrl);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      setShowUserMenu(false);
      setActiveSection('scienceandfun');
    }
  };

  return (
    <nav className="bg-black border-b border-[#00FF00]/30 sticky top-0 z-40 font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex flex-col">
            <h1 className="text-xl font-bold text-[#00FF00] tracking-tighter flex items-center">
              <span className="animate-pulse mr-2">{'>'}</span>
              SF_ROOT
            </h1>
            {!apiConfigured && (
              <p className="text-[10px] text-red-500 animate-pulse">ERR: DISCONNECTED</p>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {[
              { id: 'scienceandfun', label: 'COURSES.bin' },
              { id: 'leaderboard', label: 'RANKINGS.sys', protected: true },
              { id: 'profile', label: 'USER_PROFILE', protected: true },
            ].map(item => (
              (!item.protected || currentUser) && (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-3 py-1 text-xs font-bold transition-all border ${
                    activeSection === item.id
                      ? 'bg-[#00FF00] text-black border-[#00FF00]'
                      : 'text-[#00FF00]/70 border-transparent hover:border-[#00FF00]/50 hover:text-[#00FF00]'
                  }`}
                >
                  {item.label}
                </button>
              )
            ))}

            {/* User Menu - Only show if logged in, otherwise hide login buttons */}
            {currentUser && (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-1 border border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00]/10 transition"
                >
                  <span className="text-xs">[{currentUser.email?.charAt(0).toUpperCase()}]</span>
                  <span className="text-[10px] opacity-70">{userData?.totalXP || 0}XP</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-black border border-[#00FF00] shadow-[0_0_20px_rgba(0,255,0,0.1)] py-2 text-[#00FF00]">
                    <div className="px-4 py-3 border-b border-[#00FF00]/30 text-[10px]">
                      <p className="mb-1">UID: {currentUser.uid.substring(0, 12)}...</p>
                      <p className="mb-1">LVL: {userData?.class || 'GUEST'}</p>
                      <p className="font-bold">XP_TOTAL: {userData?.totalXP || 0}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-[#00FF00] hover:text-black transition"
                    >
                      TERMINATE_SESSION
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#00FF00] p-2"
            >
              {mobileMenuOpen ? 'CLOSE_X' : 'MENU_='}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3 border-t border-[#00FF00]/20 mt-2">
            <div className="px-2 pt-2 space-y-1">
              {['scienceandfun', 'leaderboard', 'profile'].map(id => (
                (id === 'scienceandfun' || currentUser) && (
                  <button
                    key={id}
                    onClick={() => { setActiveSection(id); setMobileMenuOpen(false); }}
                    className={`block px-3 py-2 text-sm w-full text-left border ${
                      activeSection === id ? 'bg-[#00FF00] text-black' : 'text-[#00FF00]/70 border-transparent'
                    }`}
                  >
                    {id.toUpperCase()}
                  </button>
                )
              ))}
              {!currentUser && (
                <button
                  onClick={() => { onAuthClick(); setMobileMenuOpen(false); }}
                  className="block px-3 py-2 text-sm w-full text-left border border-[#00FF00] text-[#00FF00]"
                >
                  SIGN_IN
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
