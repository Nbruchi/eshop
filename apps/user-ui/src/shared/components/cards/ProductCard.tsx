import Image from 'next/image';
import Link from 'next/link';

interface Props {
  product: any;
  isEvent?: boolean;
}

const ProductCard = ({ product, isEvent = false }: Props) => {
  return (
    <div className="w-full min-h-[350px] h-max bg-white rounded-lg relative">
      {isEvent && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          OFFER
        </div>
      )}
      {product?.stock <= 5 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          Limited Stock
        </div>
      )}
      <Link href={`/products/${product?.slug}`}>
        <Image
          src={product?.images[0]?.fileUrl}
          alt={product?.title}
          width={300}
          height={300}
          className="w-full h-[300px] object-cover mx-auto rounded-t-md"
        />
      </Link>
    </div>
  );
};

export default ProductCard;
