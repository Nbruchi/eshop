import {
  forwardRef,
  InputHTMLAttributes,
  Ref,
  TextareaHTMLAttributes,
} from 'react';

interface BaseProps {
  label?: string;
  type?: 'text' | 'number' | 'password' | 'email' | 'textarea';
  className?: string;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = 'text', className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-semibold text-gray-300 mb-1">
            {label}
          </label>
        )}
        {type === 'textarea' ? (
          <textarea
            ref={ref as Ref<HTMLTextAreaElement>}
            className={`w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white ${className}`}
            {...(props as TextareaProps)}
          />
        ) : (
          <input
            type={type}
            ref={ref as Ref<HTMLInputElement>}
            {...(props as InputProps)}
            className={`w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white ${className}`}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
