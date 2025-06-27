import TitleBorder from './TitleBorder';

interface Props {
  title: string;
}

const SectionTitle = ({ title }: Props) => {
  return (
    <div className="relative">
      <h1 className="md:text-3xl text-xl font-semibold relative z-10">
        {title}
      </h1>
      <TitleBorder className="absolute top-[46%]" />
    </div>
  );
};

export default SectionTitle;
