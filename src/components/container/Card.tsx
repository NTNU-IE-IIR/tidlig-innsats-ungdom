import clsx from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div
      className={clsx(
        'rounded-md border border-black/10 bg-white px-2 py-1 shadow',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
