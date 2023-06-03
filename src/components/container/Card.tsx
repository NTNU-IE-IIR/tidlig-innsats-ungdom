import { VariantProps, cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const card = cva(['rounded-md border border-black/10 shadow'], {
  variants: {
    variant: {
      normal: 'bg-white',
      theme: 'bg-white',
      media: 'bg-sky-50',
    },
    pad: {
      true: 'px-2 py-1',
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
  pad = true,
  children,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(card({ variant, pad }), className)}
    >
      {children}
    </div>
  );
};

export default Card;
