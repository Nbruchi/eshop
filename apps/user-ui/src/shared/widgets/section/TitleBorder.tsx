interface Props {
  className?: string;
}

const TitleBorder = ({ className }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={114}
    height={35}
    viewBox="0 0 114 35"
    fill="none"
    className={`${className} opacity-[0.8]`}
  >
    <path
      d="M112 23.275C1.84952 -10.6834 -7.36586 1.48086 7.50443 32.9053"
      stroke="#fe296a"
      strokeWidth={4}
      strokeMiterlimit={3.8637}
      strokeLinecap="round"
    />
  </svg>
);
export default TitleBorder;
