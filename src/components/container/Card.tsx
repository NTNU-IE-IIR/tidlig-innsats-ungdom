import clsx from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ className, children, onClick }) => {
  return (
    <div
      onClick={onClick}
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
