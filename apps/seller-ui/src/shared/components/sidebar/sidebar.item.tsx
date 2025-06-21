import Link from 'next/link';
import { ReactNode } from 'react';

interface Props {
  title: string;
  icon: ReactNode;
  href: string;
  isActive?: boolean;
}

const SidebarItem = ({ title, icon, href, isActive }: Props) => {
  return (
    <Link href={href} className="my-2 block">
      <div
        className={`flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:bg-[#2b2f31] ${
          isActive &&
          'bg-[#0f3158] scale-[0.98] fill-blue-200 hover:bg-[#0f3158d6]'
        }`}
      >
        {icon}
        <h5 className="text-lg font-medium text-slate-200">{title}</h5>
      </div>
    </Link>
  );
};

export default SidebarItem;
