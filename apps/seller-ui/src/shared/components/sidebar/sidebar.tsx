'use client';

import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import { useSidebar } from 'apps/seller-ui/src/hooks/useSidebar';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import Box from '../box';
import { Sidebar } from './sidebar.styles';
import Link from 'next/link';
import Image from 'next/image';
import SidebarItem from './sidebar.item';
import {
  BellPlus,
  BellRing,
  CalendarPlus,
  LayoutDashboard,
  List,
  LogOut,
  Mail,
  PackageSearch,
  PlusSquare,
  Settings,
  TicketPercent,
  Wallet,
} from 'lucide-react';
import SidebarMenu from './sidebar.menu';

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { seller } = useSeller();
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
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px] pl-2">
                {seller?.shop?.address}
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
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/create-product'}
                title="Create Product"
                href="/dashboard/create-product"
                icon={
                  <PlusSquare
                    fill={getIconColor('/dashboard/create-product')}
                    size={22}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/all-products'}
                title="All Products"
                href="/dashboard/all-products"
                icon={
                  <PackageSearch
                    fill={getIconColor('/dashboard/all-products')}
                    size={22}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/create-event'}
                title="Create Event"
                href="/dashboard/create-event"
                icon={
                  <CalendarPlus
                    fill={getIconColor('/dashboard/create-event')}
                    size={22}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/all-events'}
                title="All Events"
                href="/dashboard/all-events"
                icon={
                  <BellPlus
                    fill={getIconColor('/dashboard/all-events')}
                    size={22}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/inbox'}
                title="Inbox"
                href="/dashboard/inbox"
                icon={
                  <Mail fill={getIconColor('/dashboard/inbox')} size={22} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/settings'}
                title="Settings"
                href="/dashboard/settings"
                icon={
                  <Settings
                    fill={getIconColor('/dashboard/settings')}
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
            <SidebarMenu title="Extras">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/discount-codes'}
                title="Discount Codes"
                href="/dashboard/discount-codes"
                icon={
                  <TicketPercent
                    fill={getIconColor('/dashboard/discount-codes')}
                    size={26}
                  />
                }
              />
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
