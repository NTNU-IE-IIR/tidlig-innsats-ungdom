import { twMerge } from 'tailwind-merge';

interface TableProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

const Table = ({ children, columns, className }: TableProps) => {
  return (
    <div
      role='table'
      className={twMerge('grid rounded-md border', className)}
      style={{
        // it's optional to set `columns`, if it's not set the grid cols 
        // will have to be defined using the `className` prop
        gridTemplateColumns: columns
          ? `repeat(${columns}, minmax(0, 1fr))`
          : undefined,
      }}
    >
      {children}
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode[];
  className?: string;
}

Table.Header = ({ children, className }: TableHeaderProps) => {
  return (
    <div
      role='row'
      className={twMerge(
        'grid rounded-t-md border-b border-zinc-300 bg-zinc-50 px-1 shadow',
        className
      )}
      style={{
        gridTemplateColumns: 'inherit',
        gridColumn: `span ${children.length} / span ${children.length}`,
      }}
    >
      {children}
    </div>
  );
};

interface TableColumnHeaderProps {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}

Table.ColumnHeader = ({
  children,
  className,
  center,
}: TableColumnHeaderProps) => {
  return (
    <h2
      role='columnheader'
      className={twMerge(
        'py-1 text-sm font-semibold',
        center && 'text-center',
        className
      )}
    >
      {children}
    </h2>
  );
};

interface TableRowProps {
  children: React.ReactNode[];
  className?: string;
}

Table.Row = ({ children, className }: TableRowProps) => {
  return (
    <div
      role='row'
      className={twMerge('grid px-1', className)}
      style={{
        gridTemplateColumns: 'inherit',
        gridColumn: `span ${children.length} / span ${children.length}`,
      }}
    >
      {children}
    </div>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

Table.Cell = ({ children, className }: TableCellProps) => {
  return (
    <div role='cell' className={className}>
      {children}
    </div>
  );
};

export default Table;
