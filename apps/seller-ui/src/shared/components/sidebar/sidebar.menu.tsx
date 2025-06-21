import { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

const SidebarMenu = ({ title, children }: Props) => {
  return (
    <div className="block">
      <h3 className="text-xs tracking-[0.04rem] pl-1">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default SidebarMenu;
