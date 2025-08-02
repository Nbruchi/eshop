interface Props {
  label: string;
  Icon: any;
  isDanger?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({
  label,
  Icon,
  isDanger = false,
  isActive = false,
  onClick,
}: Props) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
        isActive
          ? 'bg-blue-100 text-blue-600'
          : isDanger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
};

export default NavItem;
