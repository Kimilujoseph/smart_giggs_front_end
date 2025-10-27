import React, { useEffect, useState } from 'react';

// Extend the Window interface to include Tawk_API
declare global {
  interface Window {
    Tawk_API?: any;
  }
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isMinimized, setIsMinimized] = useState(false); // Start expanded by default

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var Tawk_API: any = Tawk_API || {},
      Tawk_LoadStart = new Date();
    (function () {
      var s1 = document.createElement('script'),
        s0 = document.getElementsByTagName('script')[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/67f0374fc3a94b19080d7090/1io15g4ek';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      if (s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      }
    })();
  }, []);

  const openChat = () => {
    if (window.Tawk_API) {
      window.Tawk_API.maximize(); // Opens chat widget
    } else {
      alert('Chat support is currently unavailable.');
    }
  };

  return (
    <footer
      style={{ zIndex: 999999 }}
      className={`bottom-0 left-0 right-0 w-full py-1 px-6 bg-white dark:bg-boxdark border-t border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 ${isMinimized ? 'h-8 lg:h-auto' : 'h-auto'
        }`}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        {!isMinimized && (
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {currentYear} smartGiggs. All rights reserved.
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Built by{' '}
              <a
                className="text-primary hover:underline transition-colors"
                href="https://kiruiallan.me"
                target="_blank"
                rel="noopener noreferrer"
              >
                Gamitch Technologies
              </a>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
        >
          {isMinimized ? 'Expand Footer' : 'Minimize Footer'}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
