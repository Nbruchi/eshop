import { LoaderCircle, X } from 'lucide-react';

interface Props {
  product: any;
  onRestore: () => void;
  onConfirm: () => void;
  onClose: () => void;
  isDeleting: boolean;
  isRestoring: boolean;
}

const DeleteConfirmationModal = ({
  product,
  onRestore,
  onConfirm,
  onClose,
  isDeleting,
  isRestoring,
}: Props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center w-full h-full">
      <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">Delete Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>
        <p className="text-gray-300 mt-4">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{product.title}</span>?
          <br />
          This product will be moved to a <b>delete state</b> and permanently
          deleted after <b>24 hours</b> You can recover it within this time.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md transition"
          >
            Cancel
          </button>
          <button
            onClick={!product?.isDeleted ? onConfirm : onRestore}
            disabled={isDeleting || isRestoring}
            className={`px-4 py-2 rounded-md text-white font-semibold transition ${
              product.isDeleted
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isDeleting || isRestoring ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : product.isDeleted ? (
              'Restore'
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
