import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

export interface ErrorLabelTextProps {
  text?: string;
  translatePrefix?: string;
  translate?: boolean;
  children?: never;
}

export interface ErrorLabelChildProps {
  text?: never;
  translatePrefix?: string;
  translate?: boolean;
  children?: React.ReactNode;
}

export type ErrorLabelProps = ErrorLabelTextProps | ErrorLabelChildProps;

/**
 * Error label component, used to display error messages in forms.
 * The component will not render anything unless a text or a child is specified.
 */
const ErrorLabel: React.FC<ErrorLabelProps> = ({
  text,
  translatePrefix,
  translate,
  children,
}) => {
  const { t } = useTranslation(undefined, { keyPrefix: translatePrefix });

  if (!text && !children) return <Fragment />;

  let content: React.ReactNode | string;

  if (translate) {
    if (typeof text === 'string') content = t(text);
    if (typeof children === 'string') content = t(children);
  }

  if (content === undefined) content = text ?? children;

  return (
    <strong className='text-sm font-normal text-red-500'>{content}</strong>
  );
};

export default ErrorLabel;
