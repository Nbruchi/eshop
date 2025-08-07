import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  title: string;
}

const Breadcrumb = ({ title }: Props) => {
  return (
    <div className="flex items-center">
      <Link href="/dashboard" className="text-[#80deea] cursor-pointer">
        Dashboard
      </Link>
      <ChevronRight size={20} className="opacity-[0.98]" />
      <span>{title}</span>
    </div>
  );
};

export default Breadcrumb;
