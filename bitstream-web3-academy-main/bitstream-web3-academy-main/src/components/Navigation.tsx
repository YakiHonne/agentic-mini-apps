
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Bitcoin', path: '/bitcoin' },
    { name: 'Nostr', path: '/nostr' },
    { name: 'Yakihonne', path: '/yakihonne' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0c3b9311-3309-452c-87da-373056350874.png" 
              alt="Bitstream Analytics Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-bitcoin to-purple bg-clip-text text-transparent">
              Bitstream Analytics
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-bitcoin bg-bitcoin/10'
                    : 'text-gray-700 hover:text-bitcoin hover:bg-bitcoin/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/dashboard">
              <Button className="gradient-bitcoin text-white hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-bitcoin bg-bitcoin/10'
                      : 'text-gray-700 hover:text-bitcoin hover:bg-bitcoin/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link to="/dashboard">
                <Button className="gradient-bitcoin text-white hover:opacity-90 mt-4">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
