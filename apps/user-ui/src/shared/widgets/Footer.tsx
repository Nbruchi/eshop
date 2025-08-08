'use client';

import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();

  if (pathname === '/inbox') return null;

    return <footer className="bg-[#f4f7f9] border-t border-t-slate-200 py-10 text-gray-700">
        <div className="w-[90%] lg:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* About company */}
      </div>
  </footer>;
};

export default Footer;
