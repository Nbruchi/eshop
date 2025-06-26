import { Controller, useFieldArray } from 'react-hook-form';
import Input from '../input';
import { PlusCircle, Trash2 } from 'lucide-react';

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customSpecifications',
  });

  return (
    <div>
      <label
        htmlFor="customSpecifications"
        className="block font-semibold text-gray-300 mb-1"
      >
        Custom Specifications
      </label>
      <div className="flex flex-col gap-3">
        {fields.map((_, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Controller
              name={`customSpecifications.${index}.name`}
              control={control}
              rules={{ required: `Name is required` }}
              render={({ field }) => (
                <Input
                  label="Name"
                  placeholder="e.g: Battery life, weight,..."
                  {...field}
                />
              )}
            />
            <Controller
              name={`customSpecifications.${index}.value`}
              control={control}
              rules={{ required: `Value is required` }}
              render={({ field }) => (
                <Input
                  label="Value"
                  placeholder="e.g: 1000mAh, 100g,..."
                  {...field}
                />
              )}
            />
            <button
              type="button"
              className="text-red-500 hover:text-red-700 mt-6"
              onClick={() => remove(index)}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          onClick={() => append({ name: '', value: '' })}
        >
          <PlusCircle size={20} /> Add specification
        </button>
      </div>
      {errors.customSpecifications && (
        <p className="text-error">
          {String(errors.customSpecifications.message)}
        </p>
      )}
    </div>
  );
};

export default CustomSpecifications;
