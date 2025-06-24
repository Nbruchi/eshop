import { X } from 'lucide-react';
import React from 'react';

interface Props {
  discount: any;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteDiscountCodeModal = ({ discount, onClose, onConfirm }: Props) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">Delete Discount Code</h3>
          <button
            className="text-gray-400 hover:text-white transition"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        <p className="text-gray-300 mt-4">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">
            {discount.publicName}
          </span>
          ?
          <br />
          This action cannot be <b>undone</b>
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white font-medium"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white font-medium"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDiscountCodeModal;
