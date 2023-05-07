import { Fragment } from 'react';

export interface ErrorLabelTextProps {
  text?: string;
  children?: never;
}

export interface ErrorLabelChildProps {
  text?: never;
  children?: React.ReactNode;
}

export type ErrorLabelProps = ErrorLabelTextProps | ErrorLabelChildProps;

/**
 * Error label component, used to display error messages in forms.
 * The component will not render anything unless a text or a child is specified.
 */
const ErrorLabel: React.FC<ErrorLabelProps> = ({ text, children }) => {
  if (!text && !children) return <Fragment />;

  return (
    <strong className='text-sm font-normal text-red-500'>
      {text ?? children}
    </strong>
  );
};

export default ErrorLabel;
