// src/components/layout/Navigation.jsx
import { Link, useLocation } from 'react-router-dom';
import { Menu, ChessKnight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navigation({ onMenuClick }) {
  const location = useLocation();
  
  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/registration', label: 'Registration' },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/students', label: 'Students' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden -m-2.5 p-2.5 text-gray-700"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center gap-2 ml-4 lg:ml-0">
              <ChessKnight className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl">Chess Club</span>
            </Link>
          </div>

          {/* Center section - Navigation links */}
          <div className="hidden lg:flex lg:gap-x-6">
            {links.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md',
                  location.pathname === link.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Add any additional items like user menu, notifications, etc. */}
          </div>
        </div>
      </div>
    </nav>
  );
}