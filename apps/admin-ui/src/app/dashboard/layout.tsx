import SidebarWrapper from 'apps/admin-ui/src/components/sidebar';
import React, { ReactNode } from 'react';

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className="flex h-full bg-black min-h-screen">
      {/* Sidebar */}
      <aside className="border-r w-[280px] min-w-[250px] max-w-[300px] border-r-slate-800 text-white p-4">
        <div className="sticky top-0">
          <SidebarWrapper />
        </div>
      </aside>
      <main className="flex-1">
        <div className="overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
