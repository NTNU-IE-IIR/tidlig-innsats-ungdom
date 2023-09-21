import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

interface TextAreaProps extends ComponentProps<'textarea'> {}

const TextArea: React.FC<TextAreaProps> = (props) => {
  const { className } = props;

  return (
    <textarea
      {...props}
      className={twMerge(
        'h-40 resize-none rounded-md border border-gray-300 bg-gray-100 p-2 outline-none focus:border-gray-400 focus:ring-0',
        className
      )}
    />
  );
};

export default TextArea;
