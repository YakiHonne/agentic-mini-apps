
import { Link } from 'react-router-dom';
import { Bitcoin, Zap, Users, Mail, Github, Twitter, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Footer = () => {
  const courseLinks = [
    { name: 'Bitcoin Ecosystem', path: '/bitcoin' },
    { name: 'Nostr Protocol', path: '/nostr' },
    { name: 'Yakihonne Platform', path: '/yakihonne' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  const resourceLinks = [
    { name: 'Getting Started', path: '/' },
    { name: 'Course Catalog', path: '/' },
    { name: 'Community Forum', path: '/' },
    { name: 'Help Center', path: '/' }
  ];

  const companyLinks = [
    { name: 'About Us', path: '/' },
    { name: 'Contact', path: '/' },
    { name: 'Privacy Policy', path: '/' },
    { name: 'Terms of Service', path: '/' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/0c3b9311-3309-452c-87da-373056350874.png" 
                alt="Bitstream Analytics Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">Bitstream Analytics</span>
            </div>
            <p className="text-gray-400 mb-6">
              Master the decentralized future with comprehensive education on Bitcoin, 
              Nostr, and Yakihonne. Transform from curious to confident.
            </p>
            <div className="flex space-x-4">
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Github className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Courses</h3>
            <ul className="space-y-2">
              {courseLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Get the latest updates on new courses and features.
            </p>
            <div className="flex flex-col space-y-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button className="gradient-bitcoin text-white">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Course Features */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-bitcoin rounded-lg">
                  <Bitcoin className="h-6 w-6 text-white" />
                </div>
              </div>
              <h4 className="font-semibold mb-2">Bitcoin Mastery</h4>
              <p className="text-sm text-gray-400">
                From fundamentals to Lightning Network and advanced concepts
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-purple rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <h4 className="font-semibold mb-2">Nostr Protocol</h4>
              <p className="text-sm text-gray-400">
                Censorship-resistant social protocol and decentralized identity
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-yakihonne rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <h4 className="font-semibold mb-2">Yakihonne Platform</h4>
              <p className="text-sm text-gray-400">
                Long-form publishing and community building
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Bitstream Analytics. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {companyLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
