import { VariantProps, cva } from 'class-variance-authority';
import clsx from 'clsx';

const card = cva(['rounded-md border border-black/10 px-2 py-1 shadow'], {
  variants: {
    variant: {
      normal: 'bg-white',
      theme: 'bg-white',
      media: 'bg-sky-50',
    },
  },
});

interface CardProps extends VariantProps<typeof card> {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  className,
  variant = 'normal',
  children,
  onClick,
}) => {
  return (
    <div onClick={onClick} className={clsx(card({ variant }), className)}>
      {children}
    </div>
  );
};

export default Card;
