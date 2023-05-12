import { ThemeNode } from '@/types/themes';
import { useId } from 'react';

export interface ThemeListNodeProps {
  theme: ThemeNode;
}

/**
 * Represents a node in a tree of themes.
 * This component is recursive, and will render all children themes in addition to the current theme.
 */
const ThemeListNode: React.FC<ThemeListNodeProps> = ({ theme }) => {
  const { name } = theme;

  const checkboxId = useId();

  return (
    <li>
      <div className='flex items-center gap-2'>
        <input
          id={checkboxId}
          type='checkbox'
          className='h-3.5 w-3.5 rounded-full text-emerald-500 focus:ring-1 focus:ring-emerald-700 focus:ring-offset-1'
        />
        <label htmlFor={checkboxId} className='text-base font-medium'>
          {name}
        </label>
      </div>
      <ul className='ml-4'>
        {theme.children.map((child) => (
          <ThemeListNode key={child.id} theme={child} />
        ))}
      </ul>
    </li>
  );
};

export default ThemeListNode;