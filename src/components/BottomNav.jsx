import React from 'react';
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navItems = [
    { label: 'Home', path: '/', icon: '🌸' },
    { label: 'Log', path: '/log', icon: '📝' },
    { label: 'Tips', path: '/tips', icon: '🥗' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-pink-100 z-40 py-1.5 px-4 sm:hidden shadow-lg"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-textMuted hover:text-textMain'
              }`
            }
          >
            <span className="text-lg leading-none mb-0.5">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

