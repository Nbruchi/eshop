interface Props {
  title: string;
  description?: string;
  Icon?: any;
}

const QuickActionCard = ({ Icon, title, description }: Props) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex items-start gap-4 cursor-pointer">
      <Icon className="text-blue-500 mt-1 size-6" />
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default QuickActionCard;
