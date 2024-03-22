/**
 * @file Navbar.js
 * @description Navbar component for the application
 */

import React, { useState } from 'react';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
      <nav className="w-screen mb-12 bg-white border-violet-500 dark:bg-violet-500">
      <div className="flex flex-wrap items-center justify-between p-4 mx-auto">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center ml-2 text-2xl font-semibold whitespace-nowrap dark:text-white">InFlight</span>
        </a>
        <button 
          onClick={handleMenuToggle} // Toggle menu open state when button is clicked
          className="inline-flex items-center justify-center w-10 h-10 p-2 text-sm text-white rounded-lg md:hidden hover:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white dark:hover:bg-violet-700 dark:focus:ring-violet-500"
          aria-controls="navbar-default"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
        {/* Toggle class based on menu state */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
          <ul className="flex flex-col p-4 mt-4 font-medium border rounded-lg border-violet-100 md:p-0 bg-violet-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-violet-800 md:dark:bg-violet-500 dark:border-violet-700">
            {/* Menu items */}
            <li>
              <a href="/" className="block px-3 py-2 rounded text-violet-500 hover:bg-violet-100 md:hover:bg-transparent md:border-0 md:hover:text-violet-200 md:p-0 dark:text-white md:dark:hover:text-violet-200 dark:hover:bg-violet-700 dark:hover:text-white md:dark:hover:bg-transparent" aria-current="page">Home</a>
            </li>
            <li>
              <a href="/data-analysis" className="block px-3 py-2 rounded text-violet-500 hover:bg-violet-100 md:hover:bg-transparent md:border-0 md:hover:text-violet-200 md:p-0 dark:text-white md:dark:hover:text-violet-200 dark:hover:bg-violet-700 dark:hover:text-white md:dark:hover:bg-transparent">Data Analysis</a>
            </li>
            <li>
              <a href="/performance" class="block py-2 px-3 text-violet-500 rounded hover:bg-violet-100 md:hover:bg-transparent md:border-0 md:hover:text-violet-200 md:p-0 dark:text-white md:dark:hover:text-violet-200 dark:hover:bg-violet-700 dark:hover:text-white md:dark:hover:bg-transparent">Performance Analysis</a>
            </li>
            <li>
              <a href="/advanced" class="block py-2 px-3 text-violet-500 rounded hover:bg-violet-100 md:hover:bg-transparent md:border-0 md:hover:text-violet-200 md:p-0 dark:text-white md:dark:hover:text-violet-200 dark:hover:bg-violet-700 dark:hover:text-white md:dark:hover:bg-transparent">Advanced Insights</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
