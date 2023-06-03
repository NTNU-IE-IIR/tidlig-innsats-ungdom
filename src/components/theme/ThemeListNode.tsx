import { useThemeStore } from '@/store/themeStore';
import { ThemeNode } from '@/types/themes';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useId } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ThemeListNodeProps {
  theme: ThemeNode;
  selectable?: boolean;
  onChange?: (theme: ThemeNode) => void;
  onDelete?: (theme: ThemeNode) => void;
}

/**
 * Represents a node in a tree of themes.
 * This component is recursive, and will render all children themes in addition to the current theme.
 */
const ThemeListNode: React.FC<ThemeListNodeProps> = ({
  theme,
  selectable = true,
  onChange,
  onDelete,
}) => {
  const { name } = theme;
  const { toggleTheme, isSelected } = useThemeStore();

  const checkboxId = useId();

  return (
    <li>
      <div className='flex items-center gap-2'>
        <input
          id={checkboxId}
          type='checkbox'
          checked={isSelected(theme.id)}
          onChange={() => toggleTheme(theme.id)}
          className={twMerge(
            'h-3.5 w-3.5 rounded-full text-emerald-500 focus:ring-1 focus:ring-emerald-700 focus:ring-offset-1',
            !selectable && 'hidden'
          )}
        />

        <label
          htmlFor={checkboxId}
          className='flex-1 select-none truncate text-base font-medium'
        >
          {name}
        </label>

        <div className='ml-auto flex items-center gap-1'>
          <button
            type='button'
            onClick={() => onChange?.(theme)}
            className='rounded-md border border-zinc-300 p-0.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-700'
          >
            <IconPencil className='h-4 w-4' />
            <span className='sr-only'>Rediger tema</span>
          </button>

          <button
            type='button'
            onClick={() => onDelete?.(theme)}
            className='rounded-md border border-zinc-300 p-0.5 text-zinc-600 hover:bg-zinc-100 hover:text-red-600'
          >
            <IconTrash className='h-4 w-4' />
            <span className='sr-only'>Slett tema</span>
          </button>
        </div>
      </div>

      <ul className='ml-4'>
        {theme.children.map((child) => (
          <ThemeListNode
            key={child.id}
            theme={child}
            selectable={selectable}
            onChange={onChange}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </li>
  );
};

export default ThemeListNode;
