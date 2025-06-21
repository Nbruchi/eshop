'use client';

import { useAtom } from 'jotai';
import { activeSidebarItem } from '../utils/constants';

export const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSidebarItem);

  return { activeSidebar, setActiveSidebar };
};
