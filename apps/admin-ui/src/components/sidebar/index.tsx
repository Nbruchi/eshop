'use client';

import useAdmin from 'apps/admin-ui/src/hooks/useAdmin';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BellPlus,
  BellRing,
  CalendarPlus,
  FileClock,
  LayoutDashboard,
  List,
  LogOut,
  Mail,
  PackageSearch,
  PencilRuler,
  PlusSquare,
  Settings,
  Store,
  TicketPercent,
  Users,
  Wallet,
} from 'lucide-react';
import SidebarMenu from './SidebarMenu';
import Box from '../Box';
import { Sidebar } from './sidebar.styles';
import SidebarItem from './SidebarItem';
import { useSidebar } from '../../hooks/useSidebar';

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { admin } = useAdmin();
  const pathname = usePathname();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#0085ff' : '#969696';

  return (
    <Box
      $css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: 0,
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href="/" className="flex justify-center text-center gap-2">
            <Image src="/icon.svg" alt="logo" width={200} height={40} />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {admin?.shop?.name}
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px] pl-2">
                {admin?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={
              <LayoutDashboard fill={getIconColor('/dashboard')} size={22} />
            }
            isActive={activeSidebar === 'dashboard'}
            href="/dashboard"
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/orders'}
                title="Orders"
                href="/dashboard/orders"
                icon={
                  <List fill={getIconColor('/dashboard/orders')} size={22} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/payments'}
                title="Payments"
                href="/dashboard/payments"
                icon={
                  <Wallet
                    fill={getIconColor('/dashboard/payments')}
                    size={22}
                  />
                }
              />

              <SidebarItem
                isActive={activeSidebar === '/dashboard/products'}
                title="Products"
                href="/dashboard/products"
                icon={
                  <PackageSearch
                    fill={getIconColor('/dashboard/products')}
                    size={22}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/events'}
                title="Events"
                href="/dashboard/events"
                icon={
                  <BellPlus
                    fill={getIconColor('/dashboard/events')}
                    size={22}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/users'}
                title="Users"
                href="/dashboard/users"
                icon={
                  <Users fill={getIconColor('/dashboard/users')} size={22} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/sellers'}
                title="Sellers"
                href="/dashboard/sellers"
                icon={
                  <Store fill={getIconColor('/dashboard/sellers')} size={22} />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/loggers'}
                title="Loggers"
                href="/dashboard/loggers"
                icon={
                  <FileClock
                    fill={getIconColor('/dashboard/loggers')}
                    size={22}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/management'}
                title="Management"
                href="/dashboard/management"
                icon={
                  <Settings
                    fill={getIconColor('/dashboard/management')}
                    size={22}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/notifications'}
                title="Notifications"
                href="/dashboard/notifications"
                icon={
                  <BellRing
                    fill={getIconColor('/dashboard/notifications')}
                    size={26}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Customization">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/customization'}
                title="All Customizations"
                href="/dashboard/customization"
                icon={
                  <PencilRuler
                    fill={getIconColor('/dashboard/customization')}
                    size={26}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Extra">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/logout'}
                title="Logout"
                href="/"
                icon={
                  <LogOut fill={getIconColor('/dashboard/logout')} size={26} />
                }
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;
